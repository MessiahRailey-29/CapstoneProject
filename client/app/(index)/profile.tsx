import { BodyScrollView } from '@/components/ui/BodyScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useClerk, useUser } from '@clerk/clerk-expo';
import Button from '@/components/ui/button';
import { appleRed } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export default function ProfileScreen(){
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();

    const HandleDeleteAccount = async () => {
        try {
            Alert.alert(
                "Delete account",
                "Are you sure you want to delete your account?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Delete",
                        onPress: async () => {
                            await user?.delete();
                            router.replace("/(auth)");
                        },
                        style: "destructive",
                    },
                ]
            );
        } catch (error) {
            Alert.alert ("Error", "Failed to delete account");
            console.error(error);
        }
    };
    return(
        <BodyScrollView>
            <ThemedText>Profile List</ThemedText>
            <Button onPress={signOut} variant='ghost' textStyle={{color: appleRed}}>
            Sign out
            </Button>
            <Button
            onPress={HandleDeleteAccount}
            variant="ghost"
            textStyle={{color:"gray"}}
            >
                Delete account
            </Button>
        </BodyScrollView>
    )
}