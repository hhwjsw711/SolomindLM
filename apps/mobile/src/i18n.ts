type MobileLocale = "en" | "zh";

const messages = {
  en: {
    "notFound.title": "Oops!",
    "notFound.message": "This screen doesn't exist.",
    "notFound.home": "Go to home screen!",
    "modal.title": "Modal",
    "auth.signInPlaceholder": "Sign-in runs in the web session (Notebook tab).",
    "auth.signUpPlaceholder": "Sign-up runs in the web session.",
    "editScreen.openCode": "Open up the code for this screen:",
    "editScreen.changeText":
      "Change any of the text, save the file, and your app will automatically update.",
    "editScreen.helpLink": "Tap here if your app doesn't automatically update after making changes",
    "webView.missingWebUrl":
      "Set EXPO_PUBLIC_WEB_URL in apps/mobile/.env (copy from .env.example).",
    "fileUpload.signInRequiredTitle": "Sign in required",
    "fileUpload.signInRequiredMessage":
      "Open the Home tab and complete sign-in in the web view so your session syncs to the app. Then try again.",
    "fileUpload.uploadedTitle": "Uploaded",
    "fileUpload.uploadedMessage": "Your file was added to this notebook.",
    "fileUpload.uploadFailedTitle": "Upload failed",
    "fileUpload.unknownError": "Unknown error",
    "fileUpload.addSourceTitle": "Add source",
    "fileUpload.chooseSourceMessage": "Choose a source",
    "fileUpload.file": "File",
    "fileUpload.photoLibrary": "Photo library",
    "fileUpload.camera": "Camera",
    "fileUpload.cancel": "Cancel",
    "fileUpload.cameraPermissionDenied": "Camera permission denied",
    "fileUpload.photoLibraryPermissionDenied": "Photo library permission denied",
    "fileUpload.readFileFailed": "Could not read file for upload",
    "fileUpload.storageUploadFailed": "Failed to upload file to storage",
  },
  zh: {
    "notFound.title": "页面不存在",
    "notFound.message": "这个页面不存在。",
    "notFound.home": "返回首页",
    "modal.title": "弹窗",
    "auth.signInPlaceholder": "请在网页会话中登录（Notebook 标签页）。",
    "auth.signUpPlaceholder": "请在网页会话中注册。",
    "editScreen.openCode": "打开此页面对应的代码：",
    "editScreen.changeText": "修改任意文本并保存文件，应用会自动更新。",
    "editScreen.helpLink": "如果应用在修改后没有自动更新，请点这里",
    "webView.missingWebUrl":
      "请在 apps/mobile/.env 中设置 EXPO_PUBLIC_WEB_URL（可从 .env.example 复制）。",
    "fileUpload.signInRequiredTitle": "需要登录",
    "fileUpload.signInRequiredMessage":
      "请打开首页标签页，在 WebView 中完成登录，让会话同步到应用后再试。",
    "fileUpload.uploadedTitle": "已上传",
    "fileUpload.uploadedMessage": "文件已添加到此笔记本。",
    "fileUpload.uploadFailedTitle": "上传失败",
    "fileUpload.unknownError": "未知错误",
    "fileUpload.addSourceTitle": "添加来源",
    "fileUpload.chooseSourceMessage": "选择来源",
    "fileUpload.file": "文件",
    "fileUpload.photoLibrary": "照片图库",
    "fileUpload.camera": "相机",
    "fileUpload.cancel": "取消",
    "fileUpload.cameraPermissionDenied": "相机权限已被拒绝",
    "fileUpload.photoLibraryPermissionDenied": "照片图库权限已被拒绝",
    "fileUpload.readFileFailed": "无法读取要上传的文件",
    "fileUpload.storageUploadFailed": "文件上传到存储失败",
  },
} as const;

type MessageKey = keyof (typeof messages)["en"];

function getMobileLocale(): MobileLocale {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith("zh") ? "zh" : "en";
}

export function mt(key: MessageKey): string {
  return messages[getMobileLocale()][key];
}
