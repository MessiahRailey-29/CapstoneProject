import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet } from 'react-native';
import IconCircle from '@/components/IconCircle';
import { emojies } from '@/constants/Colors';
import { useMemo } from 'react';
import { backgroundColors } from '../../../../constants/Colors';

export default function NewListScreen(){
    const randomEmoji = useMemo(
        ()=> emojies[Math.floor(Math.random()*emojies.length)],
        []
    );
    const randomColor = useMemo(
        ()=> backgroundColors[Math.floor(Math.random()*backgroundColors.length)],
        []
    );
    return(
        <BodyScrollView contentContainerStyle={{
            padding: 16,
        }}>
            <IconCircle
            emoji={randomEmoji}
            size={60}
            backgroundColor={randomColor}
            style={{alignSelf: "center"}}
            />
            <ThemedText type="subtitle">Lagye ere</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.subtitle}>
                Maglagay ng kung ano anong pagkain dine hahahahaha
            </ThemedText>
        </BodyScrollView>
    );  
}

const styles = StyleSheet.create({
    subtitle: {},
}); 