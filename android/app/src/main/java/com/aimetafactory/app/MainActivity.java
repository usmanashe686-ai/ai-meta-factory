package com.aimetafactory.app;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(DownloadPlugin.class);
        WebView webView = getBridge().getWebView();
        webView.addJavascriptInterface(new LlamaBridge(), "LlamaBridge");
    }
}
