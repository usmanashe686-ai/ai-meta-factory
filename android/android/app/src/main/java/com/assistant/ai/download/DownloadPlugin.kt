package com.assistant.ai.download

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.Plugin

@CapacitorPlugin(name = "DownloadPlugin")
class DownloadPlugin : Plugin() {

    @PluginMethod
    fun download(call: PluginCall) {
        val url = call.getString("url")
        val fileName = call.getString("fileName") ?: "model.gguf"

        if (url == null) {
            call.reject("URL is required")
            return
        }

        try {
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle("AI Model: $fileName")
                .setDescription("Downloading to AI Meta Factory")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)
                .setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    "ai_models/$fileName"
                )

            val id = downloadManager.enqueue(request)
            
            val ret = JSObject()
            ret.put("downloadId", id)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Native Download Failed: ${e.message}")
        }
    }
}
