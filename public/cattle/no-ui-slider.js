var initializing = true;

function updateMeanWeightAndMales() {
  if (!initializing) {
    let totalWeight = 0;
    let numberOfHeads = 0;
    $("[name^='weightGroup_']").each(function (i, val) {
      let indWeight = parseInt($(this).attr("name").replace("weightGroup_", ""));
      if ($("[name='quantityGroup_" + indWeight + "']").length) {
        if (parseInt($("[name='quantityGroup_" + indWeight + "']").val())) {
          numberOfHeads += parseInt($("[name='quantityGroup_" + indWeight + "']").val());
          if (parseInt($(this).val())) {
            totalWeight += parseInt($(this).val()) * parseInt($("[name='quantityGroup_" + indWeight + "']").val());
          }
        }
      }
    });

    if ($("#ul-gender-slider").length) {
      let genderSlider = document.getElementById("ul-gender-slider");
      if (numberOfHeads != parseInt(genderSlider.noUiSlider.options.range.max)) {
        genderSlider.noUiSlider.updateOptions({
          range: {
            'min': [0],
            'max': [numberOfHeads],
          }
        });
        genderSlider.noUiSlider.on('update', function (values, handle) {
          let femaleHeads = Math.floor(values);
          $("#gender-female-heads-value").html(femaleHeads + " H");
          $("#gender-male-heads-value").html((numberOfHeads - femaleHeads) + " M");
          $("[name='females']").val(femaleHeads);
        });

        $("#gender-female-heads-value").html(parseFloat(genderSlider.noUiSlider.get()).toFixed(0) + " H");
        $("#gender-male-heads-value").html(parseFloat(genderSlider.noUiSlider.options.range.max - genderSlider.noUiSlider.get()).toFixed(0) + " M");
        $("[name='females']").val(parseFloat(genderSlider.noUiSlider.get()).toFixed(0));
      }
    }

    if ($("#ul-discard-slider").length) {
      let discardSlider = document.getElementById("ul-discard-slider");
      if (numberOfHeads != parseInt(discardSlider.noUiSlider.options.range.max)) {
        discardSlider.noUiSlider.updateOptions({
          range: {
            'min': [0],
            'max': [numberOfHeads]
          }
        });
        discardSlider.noUiSlider.on('update', function (values, handle) {
          let discardedHeads = Math.floor(values);
          $("#discarded-heads-value").html(discardedHeads);
          $("[name='discard']").val(discardedHeads);
        });
        $("#discarded-heads-value").html(parseFloat(discardSlider.noUiSlider.get()).toFixed(0));
        $("[name='discard']").val(parseFloat(discardSlider.noUiSlider.get()).toFixed(0));
      }
    }

    if (totalWeight && numberOfHeads) {
      $("#mean-weight").html(Math.round(totalWeight / numberOfHeads).toFixed(0) + " kg");
    }
    else {
      $("#mean-weight").html("-- kg");
    }
  }
}

function insertSliderRow(indSlider, weight, quantity) {
  $("#cattle-weight-segmentation").append(
    `<div class="row mt-2"> 
      <div class="col-sm-12">
        <div class="form-inline">
          <p class="mb-0 font-weight-medium mr-4" style="line-height: 51px;"> Grupo ` + indSlider + `</p>
          <div class="ul-slider slider-primary noUi-target noUi-ltr noUi-horizontal w-40 mr-4" 
            id="ul-slider-` + indSlider + `">
          </div>
          <div class="input-group mr-4">
            <input class="form-control p-2" type="number" name="weightGroupD_` + indSlider + `" value="` + weight + `" style="width: 60px; height: 100%;" disabled>
            <input type="hidden" name="weightGroup_` + indSlider + `" value="` + weight + `">
            <div class="input-group-append">
              <span id="ul-units-slider-` + indSlider + `" class="input-group-text p-2">kg</span>
            </div>
          </div>
          <p class="mb-0 font-weight-medium mr-2" style="line-height: 51px;">Cant:</p>
          <input class="form-control p-2" type="number" name="quantityGroup_` + indSlider + `" value="` + quantity + `" style="width: 65px; height: 100%;">
        </div>
      </div>
    </div>
    <script>
      $("[name='quantityGroup_` + indSlider + `']").on( "change", function() {
        updateMeanWeightAndMales();
      });
    </script>`
  );
}

function activateSlider(indSlider, sliderId, startValue) {
  let sliderElement = document.getElementById(sliderId);
  if (sliderElement.noUiSlider) {
    sliderElement.noUiSlider.updateOptions({
      range: {
        'min': [99],
        'max': [700]
      },
    });
    if (startValue) {
      sliderElement.noUiSlider.set([startValue]);
    }

    updateMeanWeightAndMales();
  }
  else {
    noUiSlider.create(sliderElement, {
      start: [startValue],
      connect: [true, false],
      range: {
        'min': [99],
        'max': [700]
      }
    });
  }

  sliderElement.noUiSlider.on('update', function (values, handle) {
    let newSliderId = "ul-slider-" + (indSlider + 1);
    if (Math.floor(values) > 99) {
      if (!$("#" + newSliderId).length) {
        insertSliderRow(indSlider + 1, "", "");
        activateSlider(indSlider + 1, newSliderId, 99);
      }
      $('[name="weightGroup_' + indSlider + '"]').val(Math.floor(values));
      $('[name="weightGroupD_' + indSlider + '"]').val(Math.floor(values));
      $('#ul-units-slider-' + indSlider).addClass("bg-primary");
      $('#ul-units-slider-' + indSlider).addClass("text-white");
    }
    else {
      $('[name="weightGroup_' + indSlider + '"]').val("");
      $('[name="weightGroupD_' + indSlider + '"]').val("");
      $('#ul-units-slider-' + indSlider).removeClass("bg-primary");
      $('#ul-units-slider-' + indSlider).removeClass("text-white");
    }

    updateMeanWeightAndMales();
  });
};

$(document).ready(function () {
  if ($("#ul-gender-slider").length) {
    let __aux_females = 0;
    if ($("[name='females']").length && $("[name='females']").val()) {
      __aux_females = parseInt($("[name='females']").val());
    }

    let genderSlider = document.getElementById("ul-gender-slider");
    noUiSlider.create(genderSlider, {
      start: [__aux_females],
      connect: [true, false],
      range: {
        'min': [0],
        'max': [__aux_females]
      }
    });
  }

  if ($("#ul-discard-slider").length) {
    let __aux_discard = 0;
    if ($("[name='discard']").length && $("[name='discard']").val()) {
      __aux_discard = parseInt($("[name='discard']").val());
    }
    let discardSlider = document.getElementById("ul-discard-slider");
    noUiSlider.create(discardSlider, {
      start: [__aux_discard],
      connect: [true, false],
      range: {
        'min': [0],
        'max': [__aux_discard]
      }
    });
  }

  if (weightQuantity.length) {
    for (let index in weightQuantity) {
      let __aux_index_integer = parseInt(index) + 1;
      if (!$("#ul-slider-" + __aux_index_integer).length) {
        insertSliderRow(__aux_index_integer, weightQuantity[index].weight, weightQuantity[index].quantity);
      }
      else {
        $('[name="weightGroup_' + __aux_index_integer + '"]').val(weightQuantity[index].weight);
        $('[name="weightGroupD_' + __aux_index_integer + '"]').val(weightQuantity[index].weight);
        $('[name="quantityGroup_' + __aux_index_integer + '"]').val(weightQuantity[index].quantity);
      }
      activateSlider(__aux_index_integer, "ul-slider-" + __aux_index_integer, weightQuantity[index].weight);
    }
  }
  else {
    insertSliderRow(1, "", "");
    activateSlider(1, "ul-slider-1", 99);
  }

  initializing = false;
  updateMeanWeightAndMales();
});