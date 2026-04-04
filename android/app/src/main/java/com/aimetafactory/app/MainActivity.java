package com.aimetafactory.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import com.aimetafactory.llama.LlamaPlugin;

// Your existing DownloadPlugin (assuming it exists)
// If not, remove or comment the line that registers it.
// For now we keep it as is.

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register your existing plugins
        registerPlugin(DownloadPlugin.class);
        registerPlugin(LlamaPlugin.class);  // <-- NEW: Capacitor plugin for llama.cpp
        
        // Your custom JavaScript bridge (kept as is)
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new LlamaBridge(), "LlamaBridge");
        webView.evaluateJavascript(
            "window.llama = { generate: async (options) => { " +
            "  const result = LlamaBridge.runModel(options.modelPath, options.prompt); " +
            "  return { text: result }; " +
            "} };", null);
    }
}
