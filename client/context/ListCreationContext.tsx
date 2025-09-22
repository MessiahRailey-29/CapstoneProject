import { createContext, useContext, useState } from "react";

type ListCreationContextType = {
    selectedEmoji: string;
    selectedColor: string;
    selectedDate: Date | null;
    budget: number;
    setSelectedEmoji: (emoji: string) => void;
    setSelectedColor: (color: string) => void;
    setSelectedDate: (date: Date | null) => void;
    setBudget: (budget: number) => void;
    resetSelection: () => void;
}

const DEFAULT_EMOJI = "🛒";
const DEFAULT_COLOR = "#9ccaff";

const ListCreationContext = createContext<ListCreationContextType | undefined>(
    undefined
);

export function ListCreationProvider({children}: {
    children: React.ReactNode
})  {
    const [selectedEmoji, setSelectedEmoji] = useState(DEFAULT_EMOJI);
    const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [budget, setBudget] = useState<number>(0);

    const resetSelection = () => {
        setSelectedEmoji(DEFAULT_EMOJI);
        setSelectedColor(DEFAULT_COLOR);
        setSelectedDate(null);
        setBudget(0);
    };

    return (
        <ListCreationContext.Provider
        value = {{
            selectedColor,
            selectedEmoji,
            selectedDate,
            budget,
            setSelectedColor,
            setSelectedEmoji,
            setSelectedDate,
            setBudget,
            resetSelection,
        }}
        >
            {children}
        </ListCreationContext.Provider>
    );
}

export function useListCreation() {
    const context = useContext(ListCreationContext);

    if (context === undefined){
        throw new Error("Please wrap the component with ListCreationProvider")
    }

    return context;
}