package com.aimetafactory.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.aimetafactory.app.download.DownloadPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(DownloadPlugin.class);
    }
}
