package com.aimetafactory.app;
import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;

public class ModelRegistry {
    public static void register(Context ctx, String modelId, String path) throws Exception {
        File file = new File(ctx.getFilesDir(), "models.json");
        JSONArray arr = file.exists() ? new JSONArray(read(file)) : new JSONArray();
        JSONObject obj = new JSONObject();
        obj.put("id", modelId);
        obj.put("path", path);
        obj.put("ready", true);
        arr.put(obj);
        write(file, arr.toString());
    }
    private static String read(File f) throws Exception {
        BufferedReader br = new BufferedReader(new FileReader(f));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }
    private static void write(File f, String data) throws Exception {
        try (FileWriter fw = new FileWriter(f)) { fw.write(data); }
    }
}
