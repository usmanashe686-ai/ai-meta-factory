package com.aimetafactory.app;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.atomic.AtomicLong;

public class ChunkDownloader implements Runnable {
    private String url;
    private File file;
    private long start, end;
    private AtomicLong totalDownloaded;
    private long fileSize;

    public ChunkDownloader(String url, File file, long start, long end, AtomicLong totalDownloaded, long fileSize) {
        this.url = url;
        this.file = file;
        this.start = start;
        this.end = end;
        this.totalDownloaded = totalDownloaded;
        this.fileSize = fileSize;
    }

    @Override
    public void run() {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestProperty("Range", "bytes=" + start + "-" + end);
            try (InputStream in = conn.getInputStream();
                 RandomAccessFile raf = new RandomAccessFile(file, "rw")) {
                raf.seek(start);
                byte[] buffer = new byte[8192];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    raf.write(buffer, 0, len);
                    totalDownloaded.addAndGet(len);
                }
            }
        } catch (Exception e) { e.printStackTrace(); }
    }
}
