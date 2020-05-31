function myFunction() {
    var input, filter, table, tr, td, i, txtValue, j;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");
    for (i = 1; i < tr.length; i++) {
      let isDisplayed;
      for (j = 0; j < tr[i].children.length; j++) {
        td = tr[i].getElementsByTagName("td")[j];
        if (td) {
          txtValue = td.textContent || td.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            isDisplayed = true;
          }
        }
      }
      if (isDisplayed) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
v 1qqwq w1121q
