package org.apache.cordova.plugin;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.hardware.display.DisplayManager;
import android.os.Build;

import java.lang.reflect.InvocationTargetException;
/**
 * This class echoes a string called from JavaScript.
 */
public class morphusSDK extends CordovaPlugin {

  public static final int ZOOM_ORIGIN_VIDEO_SIZE = 2;
  public static final int ZOOM_FULL_SCREEN_SIZE = 1;
  public static final int ZOOM_FULL_VIDEO_SIZE = 0;

  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("echo")) {
      String message = args.getString(0);
      this.echo(message, callbackContext);
      return true;
    }
    if (action.equals("set3DModeParallel")) {
      int mode = args.getInt(0);
      this.set3DModeParallel(mode, callbackContext);
      return true;
    }
    if (action.equals("set3DModeSideBySide")) {
      int mode = args.getInt(0);
      this.set3DModeSideBySide(mode, callbackContext);
      return true;
    }
    if (action.equals("is3DModeSupported")) {
      this.is3DModeSupported(callbackContext);
      return true;
    }

    return false;
  }

  private void echo(String message, CallbackContext callbackContext) {
    if (message != null && message.length() > 0) {
      if(this.isSdkJB42OrAbove())
        message = "sdk version is greater than 17";
      else
        message = "sdk version lower than 17";
      callbackContext.success(message);
    } else {
      callbackContext.error("Expected one non-empty string argument.");
    }
  }

  private static boolean isSdkJB42OrAbove() {
    return Build.VERSION.SDK_INT >= 17;
  }

  public void is3DModeSupported(CallbackContext callbackContext) {
    Context context = this.cordova.getActivity().getApplicationContext();
    DisplayManager mDisplayManager = (DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);
    Class<?> ownerClass = mDisplayManager.getClass();

    Object[] args;
    int mode3dToSet = 1 + ZOOM_ORIGIN_VIDEO_SIZE;
    args = new Object[ZOOM_ORIGIN_VIDEO_SIZE];
    args[ZOOM_FULL_VIDEO_SIZE] = Integer.valueOf(ZOOM_FULL_SCREEN_SIZE);
    args[ZOOM_FULL_SCREEN_SIZE] = Integer.valueOf(mode3dToSet);
    Class[] methodArgs = new Class[args.length];
    int i = 0;
    for (Object obj2 : args) {
        if (obj2 instanceof Integer) {
            methodArgs[i] = Integer.TYPE;
        } else {
            methodArgs[i] = args[i].getClass();
        }
        i++;
    }

    try {                
      // parameter type is null
      Object obj = ownerClass.getMethod("setDisplay3DMode", methodArgs);
      callbackContext.success("Support 3D Mode!");     
    }
    catch(NoSuchMethodException e) {
      callbackContext.error("3D Mode Is Not Supported!");
    }
  }

  public void set3DModeParallel(int mode3d, CallbackContext callbackContext) {
    if (!isSdkJB42OrAbove()) {
      callbackContext.error("SDK below 17 is not supported!");
    }
    if(mode3d < 0 || mode3d > 2) {
      callbackContext.error("mode "+mode3d+ " is not supported! Only 0, 1 and 2 are accepted.");
    }
    Context context = this.cordova.getActivity().getApplicationContext();
    int mode3dToSet;
    DisplayManager mDisplayManager = (DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);

    String msg = "";
    if(mode3d == 0)
        msg = "Parallel 3d mode is off";
    else if(mode3d == 1)
        msg = "Parallel Vertical mode";
    else if(mode3d == 2)
        msg = "Parallel Horizontal mode";
    
    if (mode3d > 0) {
        mode3dToSet = mode3d + ZOOM_ORIGIN_VIDEO_SIZE;
    } else {
        mode3dToSet = ZOOM_FULL_VIDEO_SIZE;
    }

    Object[] args;

    args = new Object[ZOOM_ORIGIN_VIDEO_SIZE];
    args[ZOOM_FULL_VIDEO_SIZE] = Integer.valueOf(ZOOM_FULL_VIDEO_SIZE);
    args[ZOOM_FULL_SCREEN_SIZE] = Integer.valueOf(mode3dToSet);
    invokeMethod(mDisplayManager, "setDisplay3DMode", args);

    callbackContext.success(msg);
  }

  public void set3DModeSideBySide(int mode3d, CallbackContext callbackContext) {
    if (!isSdkJB42OrAbove()) {
        callbackContext.error("SDK below 17 is not supported!");
    }
    Context context = this.cordova.getActivity().getApplicationContext();
    int mode3dToSet;
    DisplayManager mDisplayManager = (DisplayManager) context.getSystemService(Context.DISPLAY_SERVICE);

    String msg = "";
    if(mode3d == 0)
        msg = "Side-By-Side 3d mode is off";
    else if(mode3d == 1)
        msg = "Side-By-Side Vertical mode";
    else if(mode3d == 2)
        msg = "Side-By-Side Horizontal mode";

    if (mode3d > 0) {
        mode3dToSet = mode3d + ZOOM_ORIGIN_VIDEO_SIZE;
    } else {
        mode3dToSet = ZOOM_FULL_VIDEO_SIZE;
    }

    Object[] args;

    args = new Object[ZOOM_ORIGIN_VIDEO_SIZE];
    args[ZOOM_FULL_VIDEO_SIZE] = Integer.valueOf(ZOOM_FULL_SCREEN_SIZE);
    args[ZOOM_FULL_SCREEN_SIZE] = Integer.valueOf(mode3dToSet);
    invokeMethod(mDisplayManager, "setDisplay3DMode", args);

    callbackContext.success(msg);
  }

  private static Object invokeMethod(Object owner, String methodName, Object[] args) {
    Object obj = null;
    Class<?> ownerClass = owner.getClass();
    Class[] methodArgs = new Class[args.length];
    int i = 0;
    for (Object obj2 : args) {
        if (obj2 instanceof Integer) {
            methodArgs[i] = Integer.TYPE;
        } else {
            methodArgs[i] = args[i].getClass();
        }
        i++;
    }
    try {
        try {
            obj = ownerClass.getMethod(methodName, methodArgs).invoke(owner, args);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e2) {
            e2.printStackTrace();
        } catch (InvocationTargetException e3) {
            e3.printStackTrace();
        }
    } catch (NoSuchMethodException e4) {

    }
    return obj;
  }
};
