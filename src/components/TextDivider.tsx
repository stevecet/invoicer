import { StyleSheet, View } from "react-native";
import { Divider, Text } from "react-native-paper";

export const TextDivider = ({ label }: { label: string }) => (
    <View style={styles.dividercontainer}>
        <Divider style={styles.dividerline} />
        <Text style={styles.dividertext}>{label}</Text>
        <Divider style={styles.dividerline} />
    </View>
);
const styles = StyleSheet.create({
    dividercontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    dividerline: {
        flex: 1,
        height: 1,
    },
    dividertext: {
        marginHorizontal: 10,
        fontSize: 14,
        color: 'gray',
    },
});