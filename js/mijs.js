$(document).ready(function() {
  var max_inputs      = 10; //Cantidad maxima de inputs
  var inputs          = [];
  var form_operandos  = $("#form-operandos");
  var btn_agregar_op  = $("#btn-agregar-op");
  var btn_calcular    = $("#btn-calcular");
  var main_container  = $("#main-container");
  var btn_config      = $('#btn-config');
  var btn_default_values = $('#default-values');

  //Extraído de stackoverflow.com/a/14794066
  function isInt(value) {
    return !isNaN(value) &&
    parseInt(Number(value)) == value &&
    !isNaN(parseInt(value, 10));
  }

  function removeErr(formComponent) {
    $(formComponent).closest('.form-group')
    .removeClass('has-error')
    .find('p').remove();
  }

  function addErr(formComponent, msg) {
    $(formComponent).closest('.form-group')
    .addClass('has-error')
    .append('<p style="margin-top:8px; color:red">' + msg + '</p>');
  }

  $(btn_config).click(function(e) {
    e.preventDefault();
    $('#params').slideToggle();
  });

  $(btn_default_values).click(function(e) {
    $('#ni').val('30');
    $('#alfa').val('0.7');
    $('#alfamax').val('8');
    $('#betamin').val('0.2');
    $('#betacero').val('1');
    $('#topnum').val('6');
    $('#gamma').val('1');
    $('#maxgen').val('1500');
    $('#maxsametop').val('5');
  });

  $('[data-toggle="tooltip"]').tooltip();

  for (var i = 0; i < max_inputs; i++) {
    inputs[i] = 0;
  }

  var x = 2;
  for (var i = 0; i < x; i++) {
    inputs[i] = 1;
  }

  $(btn_agregar_op).click(function(e) {
    e.preventDefault();
    if(x < max_inputs) {
      x++;
      for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i]) {
          inputs[i] = 1;
          ix = i + 1;
          $(form_operandos).append('<div class="form-group"><label for="op' + ix + '" class="control-label col-xs-3">Operando</label><div class="col-xs-3"><input type="text" class="form-control pal" id="op' + ix + '" style="text-align:center"></div><button class="btn btn-danger remove_field" type="button"><span class="glyphicon glyphicon-remove"></span></button></div>');
          break;
        }
      }
    }
  });

  $(form_operandos).on("click",".remove_field", function(e) {
    x--;
    e.preventDefault();
    var parentDiv = $(this).parent('div');
    var opId = parseInt(parentDiv.find('input').attr('id').substring(2, 4));
    var i = opId - 1;
    inputs[i] = 0;
    parentDiv.remove();
  });

  $(btn_calcular).click(function(e) {
    e.preventDefault();
    var $btn = $(this).button('loading');

    //PREPARACION DE ENTRADAS

    //Chequeo de Operandos
    var operandos = [];
    var opString = "";
    checkFlag = false;
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i]) {
        var opId = '#op' + (i + 1);
        var opVal = $(opId).val().toUpperCase();
        //Remover errores anteriores
        removeErr(opId);
        if (opVal === "") {
          //Campo vacío
          addErr(opId, 'Complete este campo.');
          checkFlag = true;
        } else if (!/^[a-zA-Z]+$/.test(opVal)) {
          //El operando no contiene letras únicamente
          addErr(opId, 'Ingrese sólo letras.');
          checkFlag = true;
        } else {
          operandos.push(opVal);
          opString += opVal;
        }
      }
    }
    //Trato de igual manera el resultado
    var resVal = $('#res').val().toUpperCase();
    removeErr('#res');
    if (resVal === "") {
      addErr('#res', 'Complete este campo.');
      checkFlag = true;
    } else if (!/^[a-zA-Z]+$/.test(resVal)) {
      addErr('#res', 'Ingrese sólo letras.');
      checkFlag = true;
    } else {
      operandos.push(resVal);
    }

    var ni = Number($('#ni').val());
    removeErr('#ni');
    if (!isInt(ni)) {
      addErr('#ni','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var alfa = Number($('#alfa').val());
    removeErr('#alfa');
    if (isNaN(alfa)) {
      addErr('#alfa','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var alfamax = Number($('#alfamax').val());
    removeErr('#alfamax');
    if (isNaN(alfamax)) {
      addErr('#alfamax','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var betamin = Number($('#betamin').val());
    removeErr('#betamin');
    if (isNaN(betamin)) {
      addErr('#betamin','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var betacero = Number($('#betacero').val());
    removeErr('#betacero');
    if (isNaN(betacero)) {
      addErr('#betacero','');
      $('#params').slideDown();
      checkFlag = true;
    }
    if (betamin > betacero) {
      addErr('#betamin','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var topnum = Number($('#topnum').val());
    removeErr('#topnum');
    if (!isInt(topnum) || topnum > ni) {
      addErr('#topnum','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var gamma = Number($('#gamma').val());
    removeErr('#gamma');
    if (isNaN(gamma)) {
      addErr('#gamma','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var maxgen = Number($('#maxgen').val());
    removeErr('#maxgen');
    if (!isInt(maxgen)) {
      addErr('#maxgen','');
      $('#params').slideDown();
      checkFlag = true;
    }

    var maxsametop = Number($('#maxsametop').val());
    removeErr('#maxsametop');
    if (!isInt(maxsametop)) {
      addErr('#maxsametop','');
      $('#params').slideDown();
      checkFlag = true;
    }

    if (checkFlag) {
      $btn.button('reset');
      return;
    }

    //Chequeo la cantidad de caracteres distintos. Si es >10 no tiene solución
    //Extraído de stackoverflow.com/a/28798478
    var unique = opString.split('')
    .filter(function(item, i, ar){return ar.indexOf(item) === i; }).join('');
    if (unique.length > 10) {
      $('#modal-chars').modal();
      $btn.button('reset');
      return;
    }

    //Operacion
    var operacion = $('input[name=operaciones]:checked', '#operacion').val();

    function terminar() {
      //PROCESAMIENTO

      //Mandar los datos al algoritmo FA
      //var letters = {A: 8, B: 7, C: 6};
      //var letters = null;
      var letters = fireflies(operandos, operacion, ni, topnum, alfa, alfamax, gamma, betacero, betamin, maxsametop, maxgen);

      if (letters == null) {
        $('#modal-timeout').modal();
        $btn.button('reset');
        return;
      }

      $('#modal-res').modal();

      //ENVIO DE SALIDAS

      //Borro los datos anteriores de la tabla
      $('#tabre').empty();
      $('#sumaletras').empty();
      $('#sumanros').empty();

      //Construir la tabla de correspondencia entre letras y números
      for (var letter in letters) {
        $('#tabre').append('<tr><td>' + letter + '</td><td>' + letters[letter]
        + '</td></tr>');
      }

      var charOp = operacion === "suma" ? '+' : '-';

      //Mostrar la suma como letras
      $('#sumaletras').append(operandos[0]);
      for (var i = 1; i < operandos.length - 1; i++) {
        var termino = charOp + ' ' + operandos[i];
        $('#sumaletras').append('<br>'+ termino);
      }
      lastOp = operandos[operandos.length-1];
      strDashes = Array(lastOp.length + 3).join('-');
      $('#sumaletras').append('<br>' + strDashes + '<br>' + lastOp);

      //Mostrar la suma como números
      //Se arma el arreglo a partir de los operandos
      var replacedOps = [];
      for (var i = 0; i < operandos.length; i++) {
        replacedOps[i] = operandos[i];
        for (var letter in letters) {
          //Sustituir a cada letra por su número
          replacedOps[i] = replacedOps[i].split(letter).join(letters[letter]);
        }
      }
      //Mostrar como en el caso anterior
      $('#sumanros').append(replacedOps[0]);
      for (var i = 1; i < replacedOps.length - 1; i++) {
        var termino = charOp + ' ' + replacedOps[i];
        $('#sumanros').append('<br>'+ termino);
      }
      lastOp = replacedOps[replacedOps.length-1];
      strDashes = Array(lastOp.length + 3).join('-');
      $('#sumanros').append('<br>' + strDashes + '<br>' + lastOp);

      $('#panel-resultado').slideDown();
      $btn.button('reset');
    }
    setTimeout(terminar, 20);
  });
});
