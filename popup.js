function getOpenTabs(callback) { // Function to get all open tabs in the current window
    chrome.tabs.query({ currentWindow: true }, callback) // Use the chrome.tabs.query API to get all open tabs in the current window
}

function displayOpenTabs() {
    const tabList = document.getElementById('tabList')
    tabList.innerHTML = '' //Initial clear to prevent duplicate entries

    getOpenTabs((openTabs) => {
        openTabs.forEach(tab => { // Loop through the array of openTabs received from the callback
            const listItem = document.createElement('li') // Create a list item for each tab
            const checkbox = document.createElement('input') // Create a checkbox input element to allow the user to select the tab
            
            checkbox.type = 'checkbox'
            checkbox.value = tab.id
            listItem.appendChild(checkbox) 

            const tabLink = document.createElement('a')
            tabLink.href = tab.url
            tabLink.textContent = tab.title
            listItem.appendChild(tabLink)

            tabList.appendChild(listItem)
        })
    })
}

function showModal() {
    const modal = document.querySelector('.modal')
    modal.classList.add('visible')
    displayOpenTabs();
}

function hideModal() {
    const modal = document.querySelector('.modal')
    modal.classList.remove('visible')
}

function buttonListeners() {
    const createGroupButton = document.getElementById('createGroupButton')
    createGroupButton.addEventListener("click", showModal)

    const doneButton = document.getElementById('doneButton')
    doneButton.addEventListener("click", createTabGroup)
}

function createTabGroup() {
    const selectedTabs = document.querySelectorAll('#tabList input[type="checkbox"]:checked')
    const groupNameInput = document.getElementById('groupNameInput')
    const groupName = groupNameInput.value.trim()

    if (!groupName || selectedTabs.length === 0)
    {
        alert("Please enter a group name and select tabs for the group.")
        return
    }

    const groupContainer = document.querySelector('.group-container')

    //Create a new tab group container
    const tabGroupContainer = document.createElement('div')
    tabGroupContainer.classList.add('tab-group-container')

    //Create a heading to show the group name
    const groupHeading = document.createElement('h3')
    groupHeading.textContent = groupName
    tabGroupContainer.appendChild(groupHeading)

    //Add selected tabs to the group container
    selectedTabs.forEach((checkbox) => {
        const tabId = checkbox.value
        chrome.tabs.get(parseInt(tabId), (tab) => {
            const tabLink = document.createElement('a')
            tabLink.href = tab.url
            tabLink.textContent = tab.title
            tabGroupContainer.appendChild(tabLink)
        })
    })

    //Append the new tab group container to the group container
    groupContainer.appendChild(tabGroupContainer)
    saveTabGroup(groupName, selectedTabs)

    //Clear the unput and hide the modal
    groupNameInput.value = ''
    hideModal();
}



const saveTabGroup = async (groupName, tabIds) => {
    const savedGroupsKey = "savedTabGroups";

    // Retrieve existing saved tab groups
    const result = await chrome.storage.sync.get(savedGroupsKey);
    const savedTabGroups = JSON.parse(result[savedGroupsKey]) || [];
    
    savedTabGroups.push({ groupName, tabIds });
    chrome.storage.sync.set({ savedGroupsKey: JSON.stringify(savedTabGroups)}, () => {
        console.log("Updated successfully.");
    });
}


buttonListeners();


