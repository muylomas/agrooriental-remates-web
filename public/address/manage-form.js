function clearOptionstoSelect(selectId, loading) {
  $("#" + selectId + " option").each(function () {
    $(this).remove();
  });

  if (loading) {
    selectLocation = document.getElementById(selectId);
    opt_empty = document.createElement('option');
    opt_empty.innerHTML = "Cargando ...";
    selectLocation.appendChild(opt_empty);
  }
}

function addOptionstoSelect(itemsArray, selectId, fields, description) {
  clearOptionstoSelect(selectId, false);

  if (itemsArray.length) {
    selectLocation = document.getElementById(selectId);
    opt_empty = document.createElement('option');
    opt_empty.innerHTML = description;
    opt_empty.value = "";
    selectLocation.appendChild(opt_empty);

    itemsArray.forEach(function (item) {
      selectLocation = document.getElementById(selectId);

      var opt = document.createElement('option');
      opt.value = item.id;
      var textArray = [];
      for (itemField in fields) {
        textArray.push(item[fields[itemField]]);
      }
      opt.innerHTML = textArray.join(", ");

      selectLocation.appendChild(opt);
    });
  }
};

function getStatesByCountry(callback) {
  $("#address-locations").addClass('d-none');
  clearOptionstoSelect('address-states', true);

  if ($("#address-country").val()) {
    $.get("/api/addresses/states/" + encodeURIComponent($("#address-country").val()), function (results) {
      if (results.states.length) {
        var emptyMessage = "Seleccionar Departamento";
        if ($("#address-country").val() == '2') {
          var emptyMessage = "Seleccionar Provincia";
        }

        addOptionstoSelect(
          results.states,
          'address-states',
          ["name"],
          emptyMessage,
        );
      }

      if (typeof callback === "function") {
        callback();
      }
    });
  }
};

function getLocationsByState(callback) {
  clearOptionstoSelect('address-locations', true);
  $("#address-locations").removeClass('d-none');

  if ($("#address-states").val()) {
    $.get("/api/addresses/locations/" + encodeURIComponent($("#address-states").val()), function (results) {

      if (results.locations.length) {
        addOptionstoSelect(
          results.locations,
          'address-locations',
          ["name", "zipCode"],
          "Seleccionar localidad",
        );

        var selectedValue = $("#address-states").val();
        if (selectedValue)
          $("input[name=stateId]").val(selectedValue);
      }

      if (typeof callback === "function") {
        callback();
      }
    });
  }
};

function locationChanged() {
  let selectedValue = $("#address-locations").val();
  if (selectedValue)
    $("input[name=locationId]").val(selectedValue);
}

function initializeStateAndLocation() {
  var stateIdValue = $("input[name=stateId]").val();
  if (stateIdValue) {
    $("#address-states").val(stateIdValue);
    getLocationsByState(
      function () {
        var locationIdValue = $("input[name=locationId]").val();
        if (locationIdValue) {
          $("#address-locations").val(locationIdValue);
        }
      }
    );
  }
};

$(document).ready(
  function () {
    getStatesByCountry(
      function () {
        initializeStateAndLocation();
      }
    );

    hideShowAreacode();
  }
);