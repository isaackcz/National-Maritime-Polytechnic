const WelcomeGreeting = ({ name }) => {
    const currentHour = new Date().getHours();
    let greeting = "";
    if (currentHour < 12) { greeting = "GOOD MORNING"; } 
    else if (currentHour < 18) { greeting = "GOOD AFTERNOON"; } 
    else { greeting = "GOOD EVENING"; }

    return (
        <>
            { greeting }, { name }!
        </>
    )
}

export default WelcomeGreeting;