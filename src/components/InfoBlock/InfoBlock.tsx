import { Group, Paper, Text, ThemeIcon } from '@mantine/core'
import {IInfoBlockProps} from "@/app/types/types";

export const InfoBlock = (props: IInfoBlockProps) => {
    const { color, icon, title, value } = props

    return (
        <Paper p="xs" radius="lg">
            <Group mb={4} wrap="nowrap">
                <ThemeIcon color={color} size="md" variant="light">
                    {icon}
                </ThemeIcon>
                <Text fw={500} size="md" truncate>
                    {title}
                </Text>
            </Group>
            <Text c="dimmed" truncate>
                {value}
            </Text>
        </Paper>
    )
}
