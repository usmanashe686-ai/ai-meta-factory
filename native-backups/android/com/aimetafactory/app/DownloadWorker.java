package com.aimetafactory.app;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class DownloadWorker extends Worker {
    public DownloadWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        String url = getInputData().getString("url");
        String modelId = getInputData().getString("modelId");
        try {
            MultiThreadDownloader.download(getApplicationContext(), url, modelId);
            return Result.success();
        } catch (Exception e) {
            return Result.retry();
        }
    }
}
