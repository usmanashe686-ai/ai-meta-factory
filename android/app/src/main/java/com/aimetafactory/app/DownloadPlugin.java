package com.aimetafactory.app;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DownloadPlugin")
public class DownloadPlugin extends Plugin {

    @PluginMethod
    public void download(PluginCall call) {

        String url = call.getString("url");
        String fileName = call.getString("fileName");

        if (url == null) {
            call.reject("URL is required");
            return;
        }

        if (fileName == null) {
            fileName = "model.gguf";
        }

        try {
            DownloadManager dm =
                    (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);

            DownloadManager.Request request =
                    new DownloadManager.Request(Uri.parse(url));

            request.setTitle("AI Model: " + fileName);
            request.setDescription("Downloading AI Model");
            request.setMimeType("application/octet-stream");

            request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            );

            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(true);

            request.setDestinationInExternalFilesDir(
                    getContext(),
                    Environment.DIRECTORY_DOWNLOADS,
                    "ai_models/" + fileName
            );

            long id = dm.enqueue(request);

            JSObject ret = new JSObject();
            ret.put("downloadId", id);

            call.resolve(ret);

        } catch (Exception e) {
            call.reject("Download failed: " + e.getMessage());
        }
    }
}
