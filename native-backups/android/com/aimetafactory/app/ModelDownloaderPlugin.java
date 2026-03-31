package com.aimetafactory.app;

import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ModelDownloader") // This MUST be the short name
public class ModelDownloaderPlugin extends Plugin {
    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String modelId = call.getString("modelId");

        if (url == null || modelId == null) {
            call.reject("Missing URL or Model ID");
            return;
        }

        Intent intent = new Intent(getContext(), DownloadService.class);
        intent.putExtra("url", url);
        intent.putExtra("modelId", modelId);
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }
}
