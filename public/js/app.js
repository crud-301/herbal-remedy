

'use strict';

const headerContent = ['id', 'name', 'image_url', 'case_using', 'preparation', 'decription', 'accept or not']
const mainEl = document.getElementById('main-dash')

function showBottom() {
  const x = document.getElementById('show-edit');
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

const form = document.getElementById('passWordForm')

form.addEventListener('submit', getPassword)
function getPassword(event) {
  event.preventDefault()

  const newArr = []
  const password = event.target.password.value
  let herb = event.target.herb.value
  let pass = event.target.PASS.value

  let resultsFromUpdate = JSON.parse(herb)
  
    if(password === pass) {
    
    const divEl = document.createElement('div')
    mainEl.appendChild(divEl)
    
    const tableEl = document.createElement('table')
    divEl.appendChild(tableEl)
    tableEl.style.width = "400px"
    
    const tableRow = document.createElement('tr')
    tableEl.appendChild(tableRow)
    
    headerContent.forEach(element => {
      
      const tableHead = document.createElement('th')
      tableRow.appendChild(tableHead)
      tableHead.textContent = element
    })
    
    for (let i = 0; i<resultsFromUpdate.length; i++) {
      const tableRow1 = document.createElement('tr')
      tableEl.appendChild(tableRow1)
      let newArr1 = Object.values(resultsFromUpdate[i])

      let addButtom = document.createElement('a')
      let linkText = document.createTextNode("add");
      addButtom.appendChild(linkText);
      addButtom.href = `/dashboard/${resultsFromUpdate[i].id}`
      
      let addButtom2 = document.createElement('a')
      let linkText2 = document.createTextNode("remove");
      addButtom2.appendChild(linkText2);
      addButtom2.href = `/suggestion/delete/${resultsFromUpdate[i].id}`
      addButtom2.style.marginLeft = `7px`

      newArr1.forEach(element=> {
        
        const cellEl = document.createElement('td')
        tableRow1.appendChild(cellEl)
        cellEl.textContent = element

        tableRow1.appendChild(addButtom)

        tableRow1.appendChild(addButtom2)
        

        cellEl.style.border = '2px solid black'
        
      })
      
      tableRow.style.border = '2px solid black'
      tableEl.style.border = '2px solid black'
    } 
  }else {
    alert('You are not authorized to enter !!!!')
  }

}



