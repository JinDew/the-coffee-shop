// This is the project I did during the time studying React at fundamental level on Mar 2024
// I did it base on my own ideas and my own solutions, not following any tutorial
// I typed all the codes on my own without downloading or copying from anywhere

import { useState } from "react";

// https://i.pravatar.cc/48?u=933372 for example, is a website service to provide small avatar image with 6 digit number as ID
// const imageID = Number(imageURL.slice(27, 6));

const initialCustomers = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: 16,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 25,
  },
];

const initialMenu = [
  { item: "☕️", name: "Black coffee", type: "drink", price: 3 },
  { item: "🥤", name: "Americano", type: "drink", price: 4 },
  { item: "🥃", name: "Lipton tea", type: "drink", price: 2 },
  { item: "🍹", name: "Orange juice", type: "drink", price: 5 },
  { item: "🍕", name: "Pizza", type: "food", price: 5 },
  { item: "🥐", name: "Croissant", type: "food", price: 4 },
  { item: "🍔", name: "Burger", type: "food", price: 6 },
  { item: "🌮", name: "Taco", type: "food", price: 7 },
];
const initialSuggestedList = [];
export default function App() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [customerType, setCustomerType] = useState(0);
  // customerType = 0 means no customer type has been identified yet
  // customerType = 1 means returning customer (who came to the coffee shop at least once)
  // customerType = 2 means new customer

  const [selectedProfile, setSelectedProfile] = useState(initialCustomers[1]);

  const [rootSuggestedList, setRootSuggestedList] =
    useState(initialSuggestedList);
  const [showSuggestBoard, setShowSuggestBoard] = useState(false);

  function handleAddNewName(theName) {
    setSelectedProfile({ ...selectedProfile, name: theName });
  }

  function handleCustomerFinalOrder(itemPrice) {
    // if it is returning customer, then deduct balance with related ID
    if (customerType === 1) {
      setCustomers(
        customers.map((customer) =>
          customer.id === selectedProfile.id
            ? { ...customer, balance: customer.balance - itemPrice }
            : customer
        )
      );
    }

    // if it is new customer, then deduct the balance and then add to the list of old customers
    if (customerType === 2) {
      setSelectedProfile({
        ...selectedProfile,
        balance: selectedProfile.balance - itemPrice,
      });

      const newCus = {
        id: selectedProfile.id,
        name: selectedProfile.name,
        image: selectedProfile.image,
        balance: selectedProfile.balance - itemPrice,
      };

      setCustomers([...customers, newCus]);
    }

    // turn off the suggested list
    setShowSuggestBoard(false);

    // set the customer type into no customer type
    setCustomerType(0);
  }

  function HandleSubmitConvers(stype, sbudget) {
    // if customer select "drink" then create an array with only drink and turn it into the suggested list
    if (stype === "drink") {
      const selectedArr = initialMenu.filter(
        (value) => value.type === "drink" && value.price <= sbudget
      );
      setRootSuggestedList(selectedArr);
    }

    // if customer select "food" then create an array with only food and turn it into the suggested list
    if (stype === "food") {
      const selectedArr = initialMenu.filter(
        (value) => value.type === "food" && value.price <= sbudget
      );
      setRootSuggestedList(selectedArr);
    }

    // if customer select "drink and food" then create a consolidated array with both drink
    // and food, and total price of them must be less than or equal to customer budget

    if (stype === "drinkandfood") {
      const drinkArr = initialMenu.filter((value) => value.type === "drink");
      const foodArr = initialMenu.filter((value) => value.type === "food");
      const consolArr = [];

      for (let i = 0; i < drinkArr.length; i++) {
        for (let j = 0; j < foodArr.length; j++) {
          if (drinkArr[i].price + foodArr[j].price <= sbudget) {
            const satisItem = {
              item: drinkArr[i].item + foodArr[j].item,
              name: drinkArr[i].name + " and " + foodArr[j].name,
              price: drinkArr[i].price + foodArr[j].price,
            };
            consolArr.push(satisItem);
          }
        }
      }

      setRootSuggestedList(consolArr);
    }

    // turn on the suggested list
    setShowSuggestBoard(true);
    return;
  }

  function handleNextCustomer(num) {
    // if it is returning customer then take the actions for returning customers
    // else just take actions for new customers
    if (num == 1) handleReturnCustomer();
    else handleNewCustomer();
    setCustomerType(num);
  }

  function handleReturnCustomer() {
    // randomly select a profile in the array of old (existing) customers
    var ran = Math.floor(Math.random() * customers.length);
    setSelectedProfile(customers[ran]);
  }

  function handleNewCustomer() {
    // create random 6 digit number for avatar ID and random balance from 4 to 34 USD
    var ranID = Math.floor(Math.random() * 1000000);
    var ranBa = Math.floor(Math.random() * 30 + 4);
    setSelectedProfile({
      id: ranID,
      name: "New Customer",
      image: `https://i.pravatar.cc/48?u=${ranID}`,
      balance: ranBa,
    });
  }
  return (
    <div>
      <h1>Welcome to James's Coffee Shop!</h1>
      <div className="app">
        <CustomerList
          customers={customers}
          handleNextCustomer={handleNextCustomer}
        />
        <Menu theMenu={initialMenu} />
        {customerType ? (
          <div>
            <Profile customerInProfile={selectedProfile} />
            <Conversation
              customerType={customerType}
              onAddNewName={handleAddNewName}
              onSubmitConvers={HandleSubmitConvers}
            />
          </div>
        ) : (
          <div className="void-square"></div>
        )}
        {showSuggestBoard ? (
          <SuggestList
            suggestedList={rootSuggestedList}
            onCustomerFinalOrder={handleCustomerFinalOrder}
          />
        ) : (
          <div className="void-square"></div>
        )}
      </div>
    </div>
  );
}

function CustomerList({ customers, handleNextCustomer }) {
  function onNextCustomer() {
    // create a random number either 1 or 2 with probability of 50% for each
    // if 1, mean returning customer, if 2 mean new customer
    var ranNum = Math.floor(Math.random() * 2 + 1);

    handleNextCustomer(ranNum);
  }

  return (
    <div className="customer-list">
      <ul>
        {customers.map((c) => (
          <Customer each={c} key={c.id} />
        ))}
      </ul>
      <div>
        <Button onClick={onNextCustomer}>Next Customer</Button>
      </div>
    </div>
  );
}

function Customer({ each }) {
  return (
    <li className="customer">
      <img src={each.image} />
      <h3>{each.name}</h3>
      <p>Balance: {each.balance} USD</p>
    </li>
  );
}

function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

function Menu({ theMenu }) {
  return (
    <div>
      <div className="menu">
        {theMenu.map((i) => (
          <MenuItem i={i} />
        ))}
      </div>
    </div>
  );
}
function MenuItem({ i }) {
  return (
    <div className="menu-item">
      <h2>{i.item}</h2>
      <div className="just-gap"></div>
      <h4>{i.name}</h4>

      <p>${i.price}</p>
    </div>
  );
}
function Profile({ customerInProfile }) {
  return (
    <div className="profile">
      <img src={customerInProfile.image} />
      <h3>{customerInProfile.name}</h3>
      <p>Balance: {customerInProfile.balance} USD</p>
    </div>
  );
}
function Conversation({ customerType, onSubmitConvers, onAddNewName }) {
  const [cusName, setCusName] = useState("");
  const [cusOrder, setCusOrder] = useState("drink");
  const [cusBudget, setCusBudget] = useState(0);

  function showBoard(e) {
    e.preventDefault();
    // update customer name for new customer
    if (customerType == 2) {
      onAddNewName(cusName);
    }
    // add customer order and customer budget to function onSubmitConvers to generate suggested list
    onSubmitConvers(cusOrder, cusBudget);
  }

  return (
    <div>
      <form className="conversation-form">
        <h2>Conversation with Customer</h2>
        <div className={customerType !== 2 ? "gray-out" : ""}>
          <h3>Barista: What's your name pls?</h3>
          <label>Customer: </label>{" "}
          {customerType == 2 && (
            <input
              type="text"
              onChange={(e) => setCusName(e.target.value)}
            ></input>
          )}
        </div>

        <h3>Barista: What's your order pls?</h3>
        <div>
          <label>Customer: </label>
          <select onChange={(e) => setCusOrder(e.target.value)}>
            <option value="drink">Drink</option>
            <option value="food">Food</option>
            <option value="drinkandfood">Drink & Food</option>
          </select>
        </div>
        <h3>Barista: What's your budget pls?</h3>
        <div>
          <label>Customer: </label>
          <input
            type="text"
            onChange={(e) => setCusBudget(Number(e.target.value))}
          ></input>
        </div>

        <Button onClick={showBoard}>Submit</Button>
      </form>
    </div>
  );
}
function SuggestList({ suggestedList, onCustomerFinalOrder }) {
  const [selectedItem, setSelectedItem] = useState(null);

  function handleSelectedItem(choice) {
    setSelectedItem(() =>
      choice?.name === selectedItem?.name ? null : choice
    );
  }

  function letCustomerOrder(e) {
    e.preventDefault();
    onCustomerFinalOrder(selectedItem.price);
  }

  return (
    <div>
      <form className="suggested-list">
        <h2>Suggested Options</h2>
        <ul>
          {suggestedList.map((im, i) => (
            <SuggestedItem
              suggestedItem={im}
              selectedItem={selectedItem}
              onSelectedItem={handleSelectedItem}
              key={i}
            />
          ))}
        </ul>
        {selectedItem && <Button onClick={letCustomerOrder}>Order!</Button>}
      </form>
    </div>
  );
}

function SuggestedItem({ suggestedItem, selectedItem, onSelectedItem }) {
  const isSelected = suggestedItem.name === selectedItem?.name;
  function handleCustomerChoice(e) {
    e.preventDefault();
    onSelectedItem(suggestedItem);
  }
  return (
    <li className={isSelected ? "choose-item" : ""}>
      <h2>{suggestedItem.item}</h2>
      <p> {suggestedItem.name} </p>
      <h3>${suggestedItem.price}</h3>
      <Button onClick={handleCustomerChoice}>
        {isSelected ? "Cancel" : "Select"}
      </Button>
    </li>
  );
}
