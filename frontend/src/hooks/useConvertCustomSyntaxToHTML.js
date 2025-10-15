import dayjs from 'dayjs';
import React from 'react'

const useConvertCustomSyntaxToHTML = () => {
    const convertText = (data) => {
        const text = data
            .replace('{br}', '<br/>')
            .replace('{b}', '<b>').replace('{/b}', '</b>')
            .replace('{month}', dayjs().format('MMMM'))
            .replace('{currentDay}', dayjs().day());

        console.log(text);
        return text;
    }

    return { convertText };
}

export default useConvertCustomSyntaxToHTML;