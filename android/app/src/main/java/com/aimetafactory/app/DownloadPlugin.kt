package com.aimetafactory.app

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import com.getcapacitor.*

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
            val dm = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle("AI Model: $fileName")
                .setDescription("Downloading AI Model")
                .setMimeType("application/octet-stream")
                .setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
                )
                .setAllowedOverMetered(true)
                .setAllowedOverRoaming(true)
                .setDestinationInExternalFilesDir(
                    context,
                    Environment.DIRECTORY_DOWNLOADS,
                    "ai_models/$fileName"
                )

            val id = dm.enqueue(request)

            val ret = JSObject()
            ret.put("downloadId", id)
            call.resolve(ret)

        } catch (e: Exception) {
            call.reject("Native Download Failed: ${e.message}")
        }
    }
}
