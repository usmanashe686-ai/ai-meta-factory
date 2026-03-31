package com.aimetafactory.app;

import android.content.Context;
import android.util.Log;
import com.getcapacitor.JSObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.atomic.AtomicLong;

public class MultiThreadDownloader {
    private static final int THREAD_COUNT = 4;
    private static AtomicLong totalDownloaded = new AtomicLong(0);

    public static void download(Context ctx, String urlStr, String modelId) throws Exception {
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        long fileSize = conn.getContentLengthLong();
        conn.disconnect();

        File dir = new File(ctx.getExternalFilesDir(null), "models");
        if (!dir.exists()) dir.mkdirs();
        File file = new File(dir, modelId + ".gguf");

        // Pre-allocate file size
        RandomAccessFile raf = new RandomAccessFile(file, "rw");
        raf.setLength(fileSize);
        raf.close();

        long partSize = fileSize / THREAD_COUNT;
        Thread[] threads = new Thread[THREAD_COUNT];

        for (int i = 0; i < THREAD_COUNT; i++) {
            long start = i * partSize;
            long end = (i == THREAD_COUNT - 1) ? fileSize - 1 : (start + partSize - 1);
            threads[i] = new Thread(new ChunkDownloader(urlStr, file, start, end, totalDownloaded, fileSize));
            threads[i].start();
        }

        for (Thread t : threads) t.join();
        
        // Register in JSON after success
        ModelRegistry.register(ctx, modelId, file.getAbsolutePath());
    }
}
