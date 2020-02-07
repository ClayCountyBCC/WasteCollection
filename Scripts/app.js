function Search(ev)
{
  console.log('searching');
  ev.preventDefault();
  var e = document.getElementById('Error');
  e.innerText = "";
  e.style.display = "none";

  if (!Validate())
  {
    e.innerText = "Please check the values entered and try again.  The house number must be a number, and the street must not contain numbers.";
    e.style.display = "block";
    return;
  }
  document.getElementById('Searching').style.display = "inline-block";

  var house = document.getElementById('house').value;
  var street = document.getElementById('street').value.toUpperCase();

  $.get(
    'API/Zone/Search?house=' + house + '&street=' + street,
    "",
    Success,
    'json');
  return true;
}

function Success(data, status, jqxhr)
{
  console.log('success');
  BuildResults(data);
  document.getElementById('Searching').style.display = "none";
  console.log(data);
}

function Validate()
{
  console.log('validate');
  var housenumber = document.getElementById('house').value;
  var street = document.getElementById('street').value;
  return housenumber.length > 0 && street.length > 0;
}

function BuildResults(data)
{
  var target = document.getElementById('results');
  target.innerHTML = "";
  var table = document.createElement("table");
  table.classList.add("table", "table-striped");
  table.appendChild(BuildTableHeaderRow());
  var tbody = document.createElement("tbody");
  if (data.length === 0)
  {
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    cell.colSpan = 4;
    cell.appendChild(document.createTextNode("No data was found for this search."));
    row.appendChild(cell);
    tbody.appendChild(row);
  }
  else
  {
    data.map(function (d)
    {
      console.log('data in data.map', d);
      var row = BuildTableRow(
        d.RegionName
        , d.WholeAddress
        , d.City
        , d.Zip
        , d.Garbage
        , d.Yard
        , d.Recycle
        , d.Contractor
        , d.Phone
        , d.Website
        ,false);
      tbody.appendChild(row);
    });
  }
  table.appendChild(tbody);
  target.appendChild(table);
  target.style.display = "block";
}

function BuildTableHeaderRow()
{
  let thead = document.createElement("thead");
  let row = BuildTableRow("Region", "Address", "City",
    "Zip", "Garbage", "Yard", "Recycle", "Contractor", "Phone", "Website", true);
  thead.appendChild(row);
  return thead;
}

function BuildTableRow(
  region,
  address,
  city,
  zip,
  garbage,
  yard,
  recycle,
  contractor,
  phone,
  website,
  isHeader)
{
  var row = document.createElement("tr");
  var colTag = isHeader ? "TH" : "TD";
  row.appendChild(createTableElement(address, "20%", colTag));
  row.appendChild(createTableElement(city, "20%", colTag));
  row.appendChild(createTableElement(zip, "10%", colTag));
  if (garbage.length === 0)
  {
    let message = createTableElement("Days not available for Municipal customers. Please visit the website for more information.", "30%", colTag);
    message.colSpan = "3";
    row.appendChild(message);    
  }
  else
  {
    row.appendChild(createTableElement(garbage, "10%", colTag));
    row.appendChild(createTableElement(yard, "10%", colTag));
    row.appendChild(createTableElement(recycle, "10%", colTag));
  }
  if (isHeader)
  {
    row.appendChild(createTableElement(website, "20%", colTag));
  }
  else
  {
    row.appendChild(createWebsiteLink(garbage.length === 0 ? region : "Clay County", website, "20%", colTag));  
  }
  
  return row;
}

function createTableElement(value, width, colTag)
{
  var d = document.createElement(colTag);
  d.style.width = width;
  d.appendChild(document.createTextNode(value));
  return d;
}

function createWebsiteLink(label, link, width, colTag)
{
  var d = document.createElement(colTag);
  d.style.width = width;
  var a = document.createElement("a");
  a.href = link;
  a.ref = "noopener noreferrer";
  a.appendChild(document.createTextNode(label));
  d.appendChild(a);
  return d;
}