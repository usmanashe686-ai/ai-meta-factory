package com.aimetafactory.llama;

public class LlamaNative {
    static {
        System.loadLibrary("llama"); // loads libllama.so
    }

    public native String generate(String prompt, String modelPath);
}
