// simplifies the api returned from navigator.getgamepads for use with our particular arcade sticks
export interface CondensedGamepadInputs {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    AButton: boolean;
    BButton: boolean;
}

// maps the true or false of the condensedgamepadinputs to an index in the actionArray, so we can randomize actions.
export interface GamepadToActionIndex {
    // gamepad 0 index map
    up0: number | undefined;
    down0: number | undefined;
    right0: number | undefined;
    left0: number | undefined;
    AButton0: number | undefined;
    BButton0: number | undefined;
    // gamepad 1 index map
    up1: number | undefined;
    down1: number | undefined;
    right1: number | undefined;
    left1: number | undefined;
    AButton1: number | undefined;
    BButton1: number | undefined;
    // gamepad 2 index map
    up2: number | undefined;
    down2: number | undefined;
    right2: number | undefined;
    left2: number | undefined;
    AButton2: number | undefined;
    BButton2: number | undefined;
    // gamepad 3 index map
    up3: number | undefined;
    down3: number | undefined;
    right3: number | undefined;
    left3: number | undefined;
    AButton3: number | undefined;
    BButton3: number | undefined;
}

//gets the current state of the gamepads and returns condensedgamepadinputs for use in other parts of the program.
export const getGamepads2 = () => {
    const gamepads = navigator.getGamepads();
    let gamePadsToReturn: (CondensedGamepadInputs | undefined)[] = [undefined, undefined, undefined, undefined];

    if(gamepads[0]) {
        gamePadsToReturn[0] = {
            up: gamepads[0]?.axes[0] > 0,
            down: gamepads[0]?.axes[0] < 0,
            left: gamepads[0]?.axes[1] > 0,
            right: gamepads[0]?.axes[1] < 0,
            AButton: gamepads[0]?.buttons[0].pressed,
            BButton: gamepads[0]?.buttons[1].pressed,
        };
    }
    if(gamepads[1]) {
        gamePadsToReturn[1] = {
            up: gamepads[1]?.axes[0] > 0,
            down: gamepads[1]?.axes[0] < 0,
            left: gamepads[1]?.axes[1] > 0,
            right: gamepads[1]?.axes[1] < 0,
            AButton: gamepads[1]?.buttons[0].pressed,
            BButton: gamepads[1]?.buttons[1].pressed,
        };
    }
    if(gamepads[2]) {
        gamePadsToReturn[2] = {
            up: gamepads[2]?.axes[0] > 0,
            down: gamepads[2]?.axes[0] < 0,
            left: gamepads[2]?.axes[1] > 0,
            right: gamepads[2]?.axes[1] < 0,
            AButton: gamepads[2]?.buttons[0].pressed,
            BButton: gamepads[2]?.buttons[1].pressed,
        };
    }
    if(gamepads[3]) {
        gamePadsToReturn[3] = {
            up: gamepads[3]?.axes[0] > 0,
            down: gamepads[3]?.axes[0] < 0,
            left: gamepads[3]?.axes[1] > 0,
            right: gamepads[3]?.axes[1] < 0,
            AButton: gamepads[3]?.buttons[0].pressed,
            BButton: gamepads[3]?.buttons[1].pressed,
        };
    }
    // console.log(gamePadsToReturn);
    return gamePadsToReturn;
};


// generates a mapping between the buttons that are pressed and a randomized index on our action array.
// call this once every time you want to randomize the controls. use the resulting map, as a key for making actions go. 
export const mapGamepadsToActionIndex = () => {
    let alreadyUsed: number[] = [];
    const workingMap: GamepadToActionIndex = getDefaultGamepadToActionIndex();
    const padButtonArray: string[] = Object.keys(workingMap);
    let iterator = 0;

    while(alreadyUsed.length < 24) {
        const randomNum = Math.floor(Math.random() * (24 - 0) + 0);
        if(alreadyUsed.indexOf(randomNum) === -1) {
            alreadyUsed.push(randomNum);
            const workingpadIterator = padButtonArray[iterator]; 
            workingMap[workingpadIterator as keyof typeof workingMap] = randomNum;
            iterator++;
        }   
    }
    console.log('workingMap: ', workingMap);
    return workingMap;
};

const getDefaultGamepadToActionIndex = () => {
    // all indicies here are undefined.
    const padToIndex = {
        // gamepad 0 index map
        up0: undefined,
        down0: undefined,
        right0: undefined,
        left0: undefined,
        AButton0: undefined,
        BButton0: undefined,
        // gamepad 1 index map
        up1: undefined,
        down1: undefined,
        right1: undefined,
        left1: undefined,
        AButton1: undefined,
        BButton1: undefined,
        // gamepad 2 index map
        up2: undefined,
        down2: undefined,
        right2: undefined,
        left2: undefined,
        AButton2: undefined,
        BButton2: undefined,
        // gamepad 3 index map
        up3: undefined,
        down3: undefined,
        right3: undefined,
        left3: undefined,
        AButton3: undefined,
        BButton3: undefined,
    }
    return padToIndex;
};

export const anyButtonPressed = (pads: (CondensedGamepadInputs | undefined)[]) => {
    if(pads.includes(undefined)) {
        return null;
    }
    const newArray: boolean[] = [];
    pads.forEach((pad) => {
        newArray.push(Object.values(pad));
    })
    const finalArray = newArray.flat();
    return finalArray.includes(true);
}