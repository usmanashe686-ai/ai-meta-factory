package com.aimetafactory.app;
import android.content.Intent;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ModelDownloader")
public class ModelDownloaderPlugin extends Plugin {
    @PluginMethod
    public void startDownload(PluginCall call) {
        String url = call.getString("url");
        String modelId = call.getString("modelId");
        Intent intent = new Intent(getContext(), DownloadService.class);
        intent.putExtra("url", url);
        intent.putExtra("modelId", modelId);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        JSObject ret = new JSObject();
        ret.put("status", "started");
        call.resolve(ret);
    }
}
