package com.aimetafactory.llama;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Llama")
public class LlamaPlugin extends Plugin {
    private LlamaNative nativeLib = new LlamaNative();

    @PluginMethod
    public void generate(PluginCall call) {
        String prompt = call.getString("prompt");
        String modelPath = call.getString("modelPath");
        if (prompt == null || modelPath == null) {
            call.reject("Missing prompt or modelPath");
            return;
        }
        new Thread(() -> {
            String result = nativeLib.generate(prompt, modelPath);
            JSObject ret = new JSObject();
            ret.put("text", result);
            call.resolve(ret);
        }).start();
    }
}
