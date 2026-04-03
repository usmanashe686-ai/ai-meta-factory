package com.aimetafactory.app;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(DownloadPlugin.class);
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new LlamaBridge(), "LlamaBridge");
        // Expose window.llama.generate that calls LlamaBridge.runModel
        webView.evaluateJavascript(
            "window.llama = { generate: async (options) => { " +
            "  const result = LlamaBridge.runModel(options.modelPath, options.prompt); " +
            "  return { text: result }; " +
            "} };", null);
    }
}
