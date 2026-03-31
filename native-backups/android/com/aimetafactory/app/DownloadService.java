package com.aimetafactory.app;
import android.app.*;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class DownloadService extends Service {
    private static final int NOTIF_ID = 1001;
    private static final String CHANNEL_ID = "download_channel";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String urlStr = intent.getStringExtra("url");
        String modelId = intent.getStringExtra("modelId");
        createNotificationChannel();
        startForeground(NOTIF_ID, createNotification("Initializing..."));
        new Thread(() -> downloadFile(urlStr, modelId)).start();
        return START_STICKY;
    }

    private void downloadFile(String urlStr, String modelId) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            int fileLength = conn.getContentLength();
            File dir = new File(getExternalFilesDir(null), "models");
            if (!dir.exists()) dir.mkdirs();
            File file = new File(dir, modelId + ".gguf");
            InputStream input = conn.getInputStream();
            FileOutputStream output = new FileOutputStream(file);
            byte[] buffer = new byte[8192];
            long total = 0; int count;
            while ((count = input.read(buffer)) != -1) {
                total += count;
                output.write(buffer, 0, count);
                int progress = (int) (total * 100 / fileLength);
                updateNotification(modelId, progress);
            }
            output.close(); input.close();
        } catch (Exception e) { e.printStackTrace(); }
        stopForeground(true); stopSelf();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Downloads", NotificationManager.IMPORTANCE_LOW);
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    private Notification createNotification(String text) {
        return new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("AI Model Downloader").setContentText(text)
                .setSmallIcon(android.R.drawable.stat_sys_download).build();
    }

    private void updateNotification(String modelId, int progress) {
        Notification notification = new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("Downloading: " + modelId).setContentText(progress + "%")
                .setSmallIcon(android.R.drawable.stat_sys_download).setProgress(100, progress, false).build();
        getSystemService(NotificationManager.class).notify(NOTIF_ID, notification);
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
