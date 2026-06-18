import { mt } from "@mobile/i18n";
import { Text, View } from "react-native";

/** Reserved for native @convex-dev/auth (currently WebView-first). */
export function NativeSignInPlaceholder() {
  return (
    <View style={{ padding: 16 }}>
      <Text>{mt("auth.signInPlaceholder")}</Text>
    </View>
  );
}
