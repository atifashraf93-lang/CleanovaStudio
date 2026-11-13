package pk.smaa.cleanovastudio;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Base64;
import android.view.Window;
import android.view.WindowManager;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

/** Cleanova Studio native helpers: keep screen on while exporting, save/share/open videos, phone text-to-speech to a WAV. */
@CapacitorPlugin(name = "Studio")
public class StudioPlugin extends Plugin {
    public static final int API = 1;

    private OutputStream out;
    private Uri outUri;
    private File outFile;

    private TextToSpeech tts;
    private boolean ttsReady = false;
    private boolean ttsFail = false;
    private final ConcurrentHashMap<String, PluginCall> pending = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, File> pendingFile = new ConcurrentHashMap<>();

    @PluginMethod
    public void api(PluginCall call) {
        JSObject r = new JSObject();
        r.put("api", API);
        call.resolve(r);
    }

    /* ---------------- screen on ---------------- */
    @PluginMethod
    public void keepAwake(final PluginCall call) {
        final boolean on = call.getBoolean("on", true);
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Window w = getActivity().getWindow();
                    if (on) w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else w.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } catch (Throwable t) { /* ignore */ }
                call.resolve();
            }
        });
    }

    /* ---------------- save to gallery in chunks ---------------- */
    @PluginMethod
    public void saveBegin(PluginCall call) {
        String name = call.getString("name", "Cleanova-Studio.mp4");
        String mime = call.getString("mime", "video/mp4");
        try {
            closeOut();
            if (Build.VERSION.SDK_INT >= 29) {
                ContentResolver cr = getContext().getContentResolver();
                ContentValues v = new ContentValues();
                v.put(MediaStore.Video.Media.DISPLAY_NAME, name);
                v.put(MediaStore.Video.Media.MIME_TYPE, mime);
                v.put(MediaStore.Video.Media.RELATIVE_PATH, "Movies/Cleanova Studio");
                v.put(MediaStore.Video.Media.IS_PENDING, 1);
                outUri = cr.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, v);
                if (outUri == null) { call.reject("Could not create the file in Gallery"); return; }
                out = cr.openOutputStream(outUri);
                outFile = null;
            } else {
                File dir = getContext().getExternalFilesDir(Environment.DIRECTORY_MOVIES);
                if (dir != null && !dir.exists()) dir.mkdirs();
                outFile = new File(dir, name);
                out = new FileOutputStream(outFile);
                outUri = null;
            }
            call.resolve();
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void saveChunk(PluginCall call) {
        try {
            String data = call.getString("data", "");
            byte[] b = Base64.decode(data, Base64.DEFAULT);
            if (out == null) { call.reject("No open file"); return; }
            out.write(b);
            call.resolve();
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void saveEnd(PluginCall call) {
        try {
            if (out != null) { out.flush(); out.close(); out = null; }
            JSObject r = new JSObject();
            if (outUri != null) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Video.Media.IS_PENDING, 0);
                getContext().getContentResolver().update(outUri, v, null, null);
                r.put("uri", outUri.toString());
                r.put("where", "Movies/Cleanova Studio");
            } else if (outFile != null) {
                Uri u = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", outFile);
                r.put("uri", u.toString());
                r.put("where", outFile.getAbsolutePath());
            }
            call.resolve(r);
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    private void closeOut() {
        try { if (out != null) out.close(); } catch (Throwable t) { /* ignore */ }
        out = null;
    }

    @PluginMethod
    public void shareFile(PluginCall call) {
        try {
            Uri u = Uri.parse(call.getString("uri", ""));
            Intent i = new Intent(Intent.ACTION_SEND);
            i.setType(call.getString("mime", "video/mp4"));
            i.putExtra(Intent.EXTRA_STREAM, u);
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent c = Intent.createChooser(i, call.getString("title", "Share"));
            c.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(c);
            call.resolve();
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void openFile(PluginCall call) {
        try {
            Uri u = Uri.parse(call.getString("uri", ""));
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(u, call.getString("mime", "video/*"));
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    /* ---------------- text to speech (phone voice) ---------------- */
    private interface Ready { void run(boolean ok); }

    private synchronized void withTts(final Ready r) {
        if (ttsReady && tts != null) { r.run(true); return; }
        if (ttsFail) { r.run(false); return; }
        if (tts == null) {
            tts = new TextToSpeech(getContext(), new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    ttsReady = status == TextToSpeech.SUCCESS;
                    ttsFail = !ttsReady;
                    if (ttsReady) {
                        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                            @Override public void onStart(String id) { }
                            @Override public void onDone(String id) { finish(id, null); }
                            @Override public void onError(String id) { finish(id, "TTS error"); }
                            @Override public void onError(String id, int code) { finish(id, "TTS error " + code); }
                        });
                    }
                    Ready[] l;
                    synchronized (waiters) { l = waiters.toArray(new Ready[0]); waiters.clear(); }
                    for (Ready w : l) w.run(ttsReady);
                }
            });
        }
        synchronized (waiters) { waiters.add(r); }
        if (ttsReady || ttsFail) {
            Ready[] l;
            synchronized (waiters) { l = waiters.toArray(new Ready[0]); waiters.clear(); }
            for (Ready w : l) w.run(ttsReady);
        }
    }

    private final java.util.ArrayList<Ready> waiters = new java.util.ArrayList<>();

    private void finish(String id, String err) {
        PluginCall call = pending.remove(id);
        File f = pendingFile.remove(id);
        if (call == null) return;
        try {
            if (err != null || f == null || !f.exists() || f.length() < 100) {
                call.reject(err != null ? err : "No audio produced");
                return;
            }
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            FileInputStream in = new FileInputStream(f);
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
            in.close();
            f.delete();
            JSObject r = new JSObject();
            r.put("wav", Base64.encodeToString(bo.toByteArray(), Base64.NO_WRAP));
            call.resolve(r);
        } catch (Throwable e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    private boolean has(Locale l) {
        try {
            int r = tts.isLanguageAvailable(l);
            return r >= TextToSpeech.LANG_AVAILABLE;
        } catch (Throwable t) { return false; }
    }

    @PluginMethod
    public void ttsInfo(final PluginCall call) {
        withTts(new Ready() {
            @Override
            public void run(boolean ok) {
                JSObject r = new JSObject();
                r.put("ok", ok);
                if (ok) {
                    r.put("ur", has(new Locale("ur")) || has(new Locale("ur", "PK")));
                    r.put("hi", has(new Locale("hi")) || has(new Locale("hi", "IN")));
                    r.put("en", has(Locale.ENGLISH));
                }
                call.resolve(r);
            }
        });
    }

    @PluginMethod
    public void ttsSettings(PluginCall call) {
        try {
            Intent i = new Intent("com.android.settings.TTS_SETTINGS");
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Throwable e) {
            try {
                Intent i = new Intent(android.provider.Settings.ACTION_SETTINGS);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
                call.resolve();
            } catch (Throwable e2) {
                call.reject(String.valueOf(e2.getMessage()));
            }
        }
    }

    @PluginMethod
    public void ttsSynth(final PluginCall call) {
        final String text = call.getString("text", "");
        final String lang = call.getString("lang", "en");
        final float rate = call.getFloat("rate", 1.0f);
        withTts(new Ready() {
            @Override
            public void run(boolean ok) {
                if (!ok) { call.reject("Phone text-to-speech is not available"); return; }
                try {
                    Locale l = "ur".equals(lang) ? new Locale("ur", "PK") : "hi".equals(lang) ? new Locale("hi", "IN") : Locale.ENGLISH;
                    int s = tts.setLanguage(l);
                    if (s < TextToSpeech.LANG_AVAILABLE && "ur".equals(lang)) s = tts.setLanguage(new Locale("ur"));
                    if (s < TextToSpeech.LANG_AVAILABLE) { call.reject("lang-missing"); return; }
                    tts.setSpeechRate(rate);
                    String id = "u" + System.nanoTime();
                    File f = new File(getContext().getCacheDir(), id + ".wav");
                    pending.put(id, call);
                    pendingFile.put(id, f);
                    int r = tts.synthesizeToFile(text, null, f, id);
                    if (r != TextToSpeech.SUCCESS) {
                        pending.remove(id);
                        pendingFile.remove(id);
                        call.reject("TTS could not start");
                    }
                } catch (Throwable e) {
                    call.reject(String.valueOf(e.getMessage()));
                }
            }
        });
    }
}
