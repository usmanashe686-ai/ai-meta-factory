package com.aimetafactory.llama;

public class LlamaNative {
    static {
        System.loadLibrary("llamabridge");
    }
    public native String generate(String prompt, String modelPath);
}
