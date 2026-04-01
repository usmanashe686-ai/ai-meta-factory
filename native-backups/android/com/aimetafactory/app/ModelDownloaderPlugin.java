package com.aimetafactory.app;

import androidx.work.*;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ModelDownloaderPlugin")
public class ModelDownloaderPlugin extends Plugin {
    
    @PluginMethod
    public void download(PluginCall call) {
        String url = call.getString("url");
        String modelId = call.getString("modelId");

        if (url == null || modelId == null) {
            call.reject("Missing URL or Model ID");
            return;
        }

        // Create the WorkRequest for background persistence
        Data inputData = new Data.Builder()
                .putString("url", url)
                .putString("modelId", modelId)
                .build();

        OneTimeWorkRequest downloadRequest = new OneTimeWorkRequest.Builder(DownloadWorker.class)
                .setInputData(inputData)
                .addTag("DOWNLOAD_" + modelId)
                .build();

        WorkManager.getInstance(getContext()).enqueue(downloadRequest);
        
        call.resolve();
    }
}
