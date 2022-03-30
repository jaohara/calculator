const controlContainer  = document.getElementById("app-controls");
const equationDisplay   = document.getElementById("current-equation");
const inputDisplay      = document.getElementById("current-input");
const menuOverlay       = document.getElementById("menu-container");

const appControls = {
  menu: document.getElementById("menu-button"),
  exit: document.getElementById("exit-button"),
};

const values = {
  "0": 0,
  "1": 1, 
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  decimal: ".",
}

const operators = {
  add: "+",
  subtract: "-",
  multiply: "*",
  divide: "/",
  modulo: "%",
  equals: "="
};

const operatorActions = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b,
}

const state = {
  currentInput: "",
  currentEquation: [],
  finishedCalculation: false,
  menuActive: false,
  menuReverse: false,
  toggleMenuLock: false,
  total: 0,
};

const modifyTotal = (operator, operand) => {
  if (operator === "/" && operand === 0) return false;
  state.total = operatorActions[operator](state.total, operand);
  return true;
};

const calculate = () => {
  if (state.currentEquation.length === 0) return;

  const equationStack = [...state.currentEquation].reverse();

  // first should always be a number
  state.total = equationStack.pop();

  while (equationStack.length > 0) {
    const operator  = equationStack.pop();
    const operand   = Number.parseFloat(equationStack.pop()); // undefined if last was equals

    if (getOperatorValues().includes(operator) && operator !== "=" && !Number.isNaN(operand)) {
      // TODO: is true on success, false on divide by zero
      const success = modifyTotal(operator, operand);
    }
  }

  state.finishedCalculation = true;
};

// event handlers
const toggleMenu = () => {
  if (!state.toggleMenuLock) {
    lockMenuKey();

    state.menuActive ? setTimeout(() => menuOverlay.classList.toggle("active"), 150)
      : menuOverlay.classList.toggle("active");
  
    menuOverlay.classList.toggle("opaque");
    
    flipMenuState();

    unlockMenuKey();
  }
};

// "clearall" action handler
const clearAll = () => {
  resetFinished();
  state.currentInput = "";
  resetEquation();
  updateDisplay();
  updateEquation();
}

// "clear" action handler
const clearInput = () => {
  if (state.finishedCalculation) resetEquation();
  resetFinished();
  state.currentInput = "";
  updateDisplay();
}

// "delete" action handler
const deleteInput = () => {
  state.currentInput = state.currentInput.length > 1 ? 
    state.currentInput.slice(0, state.currentInput.length - 1) : "";
  updateDisplay();
}

const getByClass = className => Array.from(document.getElementsByClassName(className));


// get all inputs
const inputs = {};
getByClass("input-button").forEach(input => inputs[input.id] = input);


// ====================
// BIND EVENT LISTENERS
// ====================

// bind value button listeners
getByClass("value-button")
  .forEach(button => button.addEventListener("click", e => appendInput(e)));

// bind operator button listeners
getByClass("operator-button")
  .forEach(button => button.addEventListener("click", e => {
    console.log(e);
    appendOperator(e);
  }));

// bind action button listeners
getByClass("action-button")
  .forEach(button => button.addEventListener("click", 
    e => actions[parseButtonName({target: button})]()));

appControls.menu.addEventListener("click", () => toggleMenu());
appControls.exit.addEventListener("click", () => window.close());

// Bind hotkeys
document.addEventListener("keydown", e => {
  // e.key === "Enter" && e.preventDefault();
  getBoundKeys().includes(getKey(e)) && inputKeys[getKey(e)](e);
});

document.addEventListener("keydown", e => console.log(`key read: ${e.key}`));



// ================
// Helper Functions
// ================

const appendInput = e => appendInputDirectly(values[parseButtonName(e)]);

const appendOperator = e => addOperatorToEquationStack(operators[parseButtonName(e)]);

const flipMenuState = () => state.menuActive = !state.menuActive;

const getBoundKeys = () => Object.keys(inputKeys);

const getKey = e => e.key.toLowerCase();

const getOperatorNames = () => Object.keys(operators);

const getOperatorValues = () => Object.values(operators);

const getTrimmedTotal = () => `${state.total}`.length > 32 ? 
  `${`${state.total}`.slice(0,30)}...`: state.total;

const lockMenuKey = () => state.toggleMenuLock = true;

const parseButtonName = e => e.target.id.split("-")[1].toLowerCase();

const peekEquationStack = () => state.currentEquation.length > 0 && 
  state.currentEquation[state.currentEquation.length - 1];

const unlockMenuKey = () => state.toggleMenuLock = false;

const resetEquation = () => state.currentEquation = [];

const resetFinished = () => state.finishedCalculation = false;

const resetInput = () => state.currentInput = "";

const resetTotal = () => state.total = 0;

const resetCalculator = () => {
  state.finishedCalculation = false;
  state.currentEquation = [];
  state.total = 0;
}

const parseBackspace = e => {
  if (e.ctrlKey && e.shiftKey) clearAll();
  else e.ctrlKey ? clearInput() : deleteInput();
};

const appendInputDirectly = input => {
  console.log(`attempting to append '${input}'`);
  
  state.finishedCalculation && resetCalculator();

  state.currentInput = input === "." && state.currentInput.includes(".") ?
  state.currentInput : state.currentInput + input;

  updateDisplay();
};

const addInputToEquationStack = () => {
  if (state.currentInput.length === 0) return;
  state.currentEquation.push(Number.parseFloat(state.currentInput));
  clearInput();
  updateEquation();
};

// TODO: clean up code reuse between this and addInputToEquationStack
const addOperatorToEquationStack = operator => {
  if (state.currentInput.length === 0 && !state.finishedCalculation) return;
  
  console.log(`passed operand check, attempting to append '${operator}'`);

  const numberInput = state.finishedCalculation && state.currentInput.length === 0 ?
    Number.parseFloat(state.total) : Number.parseFloat(state.currentInput);

  state.finishedCalculation && resetEquation();
  resetFinished();

  state.currentEquation.push(numberInput);
  state.currentEquation.push(operator);

  clearInput();

  // special case if operator is =
  if (operator === "=") {
    calculate();
    console.log(state);
    updateDisplay();
  }

  updateEquation();
};

const updateDisplay = () => {
  let displayClass  = "";
  let displayString = state.finishedCalculation ? `${state.total}` : `${state.currentInput}`;
  const { length } = displayString;

  // build class to scale output font
  if (length > 10) displayClass += "small";
  if (length > 10 && length < 20) displayClass += "er";
  if (length >= 20) displayClass += "est";

  // remove all previous classes, add class, update display
  inputDisplay.classList.remove("small", "smaller", "smallest");
  displayClass.length > 0 && inputDisplay.classList.add(displayClass);
  inputDisplay.innerHTML = displayString;
  // inputDisplay.innerHTML = state.finishedCalculation ? 
  // state.total : state.currentInput;
};

const updateEquation = () => {
  const equationComponents = [];

  state.currentEquation.forEach(component => {
    const className = Number.isNaN(Number.parseFloat(component)) ? "operator" : "number";
    
    const tag = component === "*" ? '<i class="bx bx-x"></i>' : 
      component === "/" ? '<i class="ri-divide-fill"></i>' : component;
    
    equationComponents.push(`<span class="${className}">${tag}</span>`);
  });

  equationDisplay.innerHTML = equationComponents.join(" ");

  state.currentEquation.length > 0 ? equationDisplay.classList.add("active") :
    equationDisplay.classList.remove("active");
};


// ==========================
// MAP INPUT KEYS TO HANDLERS
// ==========================

const inputKeys = {
  backspace: e => parseBackspace(e),
  escape: toggleMenu,
  "0": () => appendInputDirectly(0),  
  "1": () => appendInputDirectly(1),  
  "2": () => appendInputDirectly(2),  
  "3": () => appendInputDirectly(3),  
  "4": () => appendInputDirectly(4),  
  "5": () => appendInputDirectly(5),  
  "6": () => appendInputDirectly(6),  
  "7": () => appendInputDirectly(7),  
  "8": () => appendInputDirectly(8),  
  "9": () => appendInputDirectly(9),  
  "9": () => appendInputDirectly(9),  
  ".": () => appendInputDirectly("."),  
  "+": () => addOperatorToEquationStack("+"),  
  "-": () => addOperatorToEquationStack("-"),  
  "*": () => addOperatorToEquationStack("*"),  
  "/": () => addOperatorToEquationStack("/"),  
  "%": () => addOperatorToEquationStack("%"),  
  "=": () => addOperatorToEquationStack("="),  
};

const actions = {
  clearall: clearAll,
  clear: clearInput,
  delete: deleteInput,
};

// initialize
updateDisplay();
updateEquation();

state.menuReverse && controlContainer.classList.add("reverse-controls");