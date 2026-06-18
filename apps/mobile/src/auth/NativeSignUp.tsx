import { mt } from "@mobile/i18n";
import { Text, View } from "react-native";

/** Reserved for native sign-up. */
export function NativeSignUpPlaceholder() {
  return (
    <View style={{ padding: 16 }}>
      <Text>{mt("auth.signUpPlaceholder")}</Text>
    </View>
  );
}
