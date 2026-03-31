package com.aimetafactory.app.download;

import android.app.DownloadManager;
import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "DownloadPlugin")
public class DownloadPlugin extends Plugin {

    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String fileName = call.getString("fileName", "model.gguf");

        if (url == null) {
            call.reject("URL is required");
            return;
        }

        try {
            DownloadManager dm = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url))
                .setTitle("AI Model: " + fileName)
                .setDescription("Downloading GGUF Model")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, "ai_models/" + fileName);

            dm.enqueue(request);
            
            JSObject ret = new JSObject();
            ret.put("status", "started");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Native Error: " + e.getMessage());
        }
    }
}
