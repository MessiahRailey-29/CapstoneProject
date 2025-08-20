import { View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";

interface IconCircleprops{
    emoji: string;
    backgroundColor?: string;
    size?: number;
    style?: ViewStyle
}
export default function IconCircle({
    emoji,
    backgroundColor = "lightblue",
    size = 48,
    style,
}: IconCircleprops){
    return(
        <View
        style={[
            {
                backgroundColor,
                width: size,
                height: size,
                borderRadius: 12, 
                alignItems: "center",
                justifyContent: "center",
            },
            style,
        ]}>
            <ThemedText style= {{fontSize: 22}}>{emoji}</ThemedText>
        </View>
    )
}