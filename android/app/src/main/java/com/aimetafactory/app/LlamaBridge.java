package com.aimetafactory.app;

public class LlamaBridge {
    static {
        System.loadLibrary("llama_jni");
    }

    public static native String runModel(String modelPath, String prompt);
}
