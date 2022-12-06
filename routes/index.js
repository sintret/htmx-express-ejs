var express = require('express');
var router = express.Router();

var contactForm = (obj={}) =>{
  var email = obj.email || 'email@example.com';
  var fullname = obj.fullname || 'Andhiefitria Rosmin'
  var edit = obj.edit || false;
  return `
<div hx-target="this" hx-swap="outerHTML">
        <div class="mb-3 row">
            <label for="staticEmail" class="col-sm-2 col-form-label">Email</label>
            <div class="col-sm-10">
                <input type="email" readonly class="form-control-plaintext" value="${email}">
            </div>
        </div>
        <div class="mb-3 row">
            <label for="inputPassword" class="col-sm-2 col-form-label">FullName</label>
            <div class="col-sm-10">
                <input type="text" readonly class="form-control-plaintext" value="${fullname}">
            </div>
        </div>
      <button class="btn btn-info" hx-post="/contact">Edit</button>
    </div>
`;

}
router.get('/', function(req, res, next) {
  res.render('layout', {
    contactForm : contactForm(),
    renderBody : 'index.ejs',
  });
});

router.get('/contact', (req, res)=> {
  res.send(contactForm({}))
});

router.post('/contact', (req, res)=> {
  var body = req.body;
  var content= `<form hx-put="/contact?id=1" hx-target="this" hx-swap="outerHTML">
        <div class="mb-3 row">
            <label for="staticEmail" class="col-sm-2 col-form-label">Email</label>
            <div class="col-sm-10">
                <input type="text" name="email" class="form-control" value="email@example.com">
            </div>
        </div>
        <div class="mb-3 row">
            <label for="fullname" class="col-sm-2 col-form-label">FullName</label>
            <div class="col-sm-10">
                <input type="text" name="fullname" class="form-control" value="Andhiefitria Rosmin">
            </div>
        </div>
      <button class="btn btn-success" >Submit</button>
      <button class="btn btn-warning" hx-get="/contact">Cancel</button>

</form>`;
  res.send(content)
});

router.put('/contact', async(req,res)=> {
  var body = req.body;
  res.send(contactForm(body))
})

/*
Bulk update
 */
var data = [
  { name: "Joe Smith", email: "joe@smith.org", status: "Active" },
  { name: "Angie MacDowell", email: "angie@macdowell.org", status: "Active" },
  { name: "Fuqua Tarkenton", email: "fuqua@tarkenton.org", status: "Active" },
  { name: "Kim Yee", email: "kim@yee.org", status: "Inactive" }
];

var dataStore = () => {
  return {
    findContactById : (id)=> {
      return data[id];
    },
    allContacts : () => {
      return data;
    }
  }
}

var getIds = (params) => {
  console.log(params)
  if(params['ids']) {
    if(Array.isArray(params['ids'])) {
      return params['ids'].map(x => parseInt(x))
    } else {
      return [parseInt(params['ids'])];
    }
  } else {
    return [];
  }
}

// templates
var  displayUI=(contacts)=> {
  return `<h3>Select Rows And Activate Or Deactivate Below<h3>
               <form id="checked-contacts">
                <table class="table table-border">
                  <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                  </thead>
                  <tbody id="tbody">
                    ${displayTable([], contacts, "")}
                  </tbody>
                </table>
              </form>
              <br/>
              <div hx-include="#checked-contacts" hx-target="#tbody">
                <a class="btn btn-success" hx-put="/activate">Activate</a>
                <a class="btn btn-danger" hx-put="/deactivate">Deactivate</a>
              </div>`
}

var displayTable = (ids, contacts, action) => {
  var txt = "";
  for (var i = 0; i < contacts.length; i++) {
    var c = contacts[i];
    txt += `\n<tr class="${ids.includes(i) ? action : ""}">
                  <td><input type='checkbox' name='ids' value='${i}'></td><td>${c.name}</td><td>${c.email}</td><td>${c.status}</td>
                </tr>`
  }
  return txt;
}

router.get('/bulk-update', (req,res)=>{
  res.render('layout', {
    data:data,
    getIds : getIds,
    displayUI:displayUI,
    displayTable:displayTable,
    renderHead : 'bulk-update-css.ejs',
    renderBody : 'bulk-update.ejs',
  });
})


router.put("/activate", (req,res) => {
  var params = req.body;
  var ids = getIds(params);
  for (var i = 0; i < ids.length; i++) {
    dataStore().findContactById(ids[i])['status'] = 'Active';
  }
  res.send(displayTable(ids, dataStore().allContacts(), 'activate'));
});

router.put("/deactivate",  (req, res) => {
  var params = req.body;
  var ids = getIds(params);
  for (var i = 0; i < ids.length; i++) {
    dataStore().findContactById(ids[i])['status'] = 'Inactive';
  }
  res.send( displayTable(ids, dataStore().allContacts(), 'deactivate'));
});

/*
End bulk update
 */

module.exports = router;
