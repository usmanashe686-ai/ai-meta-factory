package com.aimetafactory.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Register the class; Capacitor uses the internal @CapacitorPlugin name
        registerPlugin(ModelDownloaderPlugin.class);
    }
}
