function reverse(s){
    // Devuelve el string 's' invertido
    return s.split("").reverse().join("");
}

function has(num, array){
    // Verifica si 'num' aparece dentro de 'array'
    for (var i in array){
        var e = array[i];
        if (e == num){
            return true
        }
    }
    return false
}

function shuffle(array){
    // Devuelve un el arreglo 'array' desordenado
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function closest(x, arr){
    // Devuelve el valor mas cercano a 'x' disponible en 'arr'
    var closest = arr[0];
    for (var i in arr){
        var j = arr[i];
        if (Math.abs(x-j) < Math.abs(x-closest)){
            closest = j;
        }
    }
    return closest;
}

function generateFirefly(letters){
    // Realiza la generación de una luciérnaga con valores aleatorios
    var decimal = [0,1,2,3,4,5,6,7,8,9];
    shuffle(decimal);
    shuffle(letters);
    var ff = {};
    for(var i in letters){
        var c = letters[i];
        ff[c] = decimal.pop();
    }
    return ff;
}

function getIntensity(ff, words, operation){
    // Calcula la intensidad del brillo de una luciérnaga
    var i = 0;
    var sum = 0;
    while (i < (words.length)-1){
        if (operation == "suma" || i == 0){
            sum = sum + getValue(words[i], ff);
        }
        else{
            sum = sum - getValue(words[i], ff);
        }
        i = i + 1
    }
    return getValue(words[words.length-1], ff) - sum;
}

function getValue(x, ff){
    // Obtiene el valor numérico que representa el string 'x' para la configuración de la luciérnaga 'ff'
    var value = 0;
    var f = (x.length)-1;
    for (var i in x){
        var c = x[i];
        value = value + (ff[c] * Math.pow(10,f));
        f = f - 1;
    }
    return value;
}

function getDistance(ff1, ff2, letters){
    // Calcula la distancia euclidiana entre las luciérnagas 'ff1' y 'ff2'
    var rij = 0;
    var rks = [];
    for (var i in letters){
        var k = letters[i];
        if (ff1[k] != ff2[k]){
            rks.push((ff1[k] - ff2[k]));
        }
    }
    for (var j in rks){
        var h = rks[j];
        rij = rij + Math.pow(h,2);
    }
    return Math.sqrt(rij);
}

function attract(ff1, ff2, betaMin, beta0, alfa, gamma, letters){
    // Realiza el movimiento de la luciérnaga 'ff1' hacia 'ff2' mediante la función de acercamiento y la
    // utilización de la función closest

    // Cálculo de la distancia
    var rij = getDistance(ff1, ff2, letters);

    // Actualización del valor beta
    var beta = betaMin + (beta0 - betaMin)*Math.exp(-gamma*Math.pow(rij,2));

    var availableNums = [0,1,2,3,4,5,6,7,8,9];
    shuffle(availableNums);
    letters = letters.reverse();
    for (var i in letters){
        var k =  letters[i];
        var newNum = Math.round(ff1[k] + beta*(ff2[k] - ff1[k]) + alfa*(Math.random()-0.5));
        if (!(has(newNum,availableNums))){
            newNum = closest(newNum, availableNums);
        }
        ff1[k] = newNum;
        var index = availableNums.indexOf(newNum);
        availableNums.splice(index,1);
    }
    return ff1;
}

function getLetters(words, operation) {
    // Devuelve un arreglo con las distintas letras que posee el problema en orden de aparición
    var letters = [];
    var revWords = [];
    for (var i in words) {
        var w = words[i];
        revWords.push(reverse(w));
    }
    var j = 0;
    if (operation == "suma") var maxLenght =  revWords[(revWords.length) - 1].length;
    else var maxLenght =  revWords[0].length;
    while (j < maxLenght) {
        for (i in revWords){
            w = revWords[i];
            if (j < w.length && !(w[j] in letters)) {
                letters.push(w[j]);
            }
        }
        j = j + 1;
    }
    letters = letters.reverse();
    return letters.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
}

function generateFireflies(ni, letters){
    // Genera 'ni' luciérnagas usando la funcion 'generateFirefly()'
    var cant = 0;
    var fireFlies = [];
    while (cant < ni){
        var ffi = generateFirefly(letters);
        fireFlies.push(ffi);
        cant = cant + 1;
    }
    return fireFlies;
}

function  findTheFittest(fireFlies, words, operation) {
    // Devuelve la luciérnaga más apta
    var mostFit = fireFlies[0];
    for (var i in fireFlies){
        var ff = fireFlies[i];
        if (Math.abs(getIntensity(ff, words, operation)) < Math.abs(getIntensity(mostFit, words, operation))){
            mostFit = ff;
        }
    }
    return mostFit;
}

function findTop(fireFlies, words, operation, topNum, topFF){
    // Devuelve las 'topNum' luciérnagas mas aptas

    // Caso base
    if (topNum == 0){
        for (var f in topFF){
            var ff = topFF[f];
            fireFlies.push(ff);
        }
        return topFF;
    }

    // Caso recursivo
    else {
        var fittest = findTheFittest(fireFlies, words, operation);
        topFF.push(fittest);
        var index = fireFlies.indexOf(fittest);
        fireFlies.splice(index,1);
        return findTop(fireFlies, words, operation, topNum - 1, topFF)
    }
}

function mutatePopulation(fireFlies, alfa, betaMin, beta0, gamma, letters){
    // Realiza una mutación a la población entera
    var j = 0;
    while (j < 3){
        for (var i in fireFlies){
            var ff = fireFlies[i];
            ff = attract(ff, ff, betaMin, beta0, alfa, gamma, letters);
        }
        j = j + 1;
    }
    return fireFlies;
}

function fireflies(words, operation, ni, topNum, alfa, alfaMax, gamma, beta0, betaMin, maxSameTop, maxGen){
    // Algoritmo de luciérnagas inteligente

    // Inicialización de variables
    var letters =  getLetters(words, operation);
    var fireFlies = generateFireflies(ni, letters);
    var i = 0;
    var iterations = 0;
    var previousTop = 0;
    var sameTop = 0;
    var found = false;

    //Inicio
    while (iterations < maxGen){
        iterations = iterations + 1;

        // Comprobación de brillo de las luciérnagas.
        var avgInt = 0;
        for (var k in fireFlies){
            var ff = fireFlies[k];
            var intensity = getIntensity(ff, words, operation);
            if (intensity == 0)
                found = true;
            avgInt = avgInt + Math.abs(intensity);
        }
        if (found)
        //Solución encontrada
            return {iter: iterations, avg: avgInt/(iterations*ni), result: ff};

        // Buscar las 'topNum' mejores luciérnagas
        var topFF = findTop(fireFlies, words, operation, topNum, []);

        // Comparación de luciérnagas
        i = 0;
        while (i < ni){
            for (var j in topFF){
                var ffj = topFF[j];
                var Ii = getIntensity(fireFlies[i], words, operation);
                var Ij = getIntensity(ffj, words, operation);
                if (Math.abs(Ij) < Math.abs(Ii)){

                    // Movimiento de ffi hacia ffj
                    fireFlies[i] = attract(fireFlies[i], ffj, betaMin, beta0, alfa, gamma, letters);
                }
            }
            i = i + 1;
        }

        // Buscar las 'topNum' mejores luciérnagas
        // topFF = findTop(fireFlies, words, operation, topNum, []);

        // Comprobar que la intensidad de la mejor haya variado desde el último ciclo
        if (Math.abs(getIntensity(findTheFittest(fireFlies, words, operation), words, operation)) == Math.abs(previousTop))
            sameTop = sameTop + 1;
        else {
            previousTop = getIntensity(topFF[0], words, operation);
            sameTop = 0;
        }

        // Si no ha variado en 5 ciclos, se muta la población
        if (sameTop > maxSameTop) fireFlies = mutatePopulation(fireFlies, alfaMax, betaMin, beta0, gamma, letters);
    }
    // Si no se encuentra solucion luego de 'maxGen' ciclos, devuelve nulo

    var avgInt = 0;
    for (var k in fireFlies){
        var ff = fireFlies[k];
        var intensity = getIntensity(ff, words, operation);
        avgInt = avgInt + Math.abs(intensity);
    }
    return {iter: maxGen, avg: avgInt/(maxGen*ni), result: null};
}

maxGen = 1000;
var MAX_TESTS = 50;
console.log("Entré");
var testCases = [];
for (var i = 0; i < MAX_TESTS; i++) {
    testCases[i] = fireflies(["COMET", "SATURN", "URANUS"], "suma", 30, 6, 0.7, 8, 1, 0.5, 0.4, 3, maxGen).iter;
    if (testCases[i] < maxGen)
        console.log("Resultado " + i + " hallado");
    else
        console.log("Resultado " + i + " no hallado en " + maxGen + " iteraciones")
}
console.log("Salí");

console.log("Cantidad de fireflies: 10");

var testAvg = 0;
var maxIter = 0;
var minIter = 9999;
for (var i = 0; i < testCases.length; i++) {
    testAvg += testCases[i];
    if (testCases[i] > maxIter) maxIter = testCases[i];
    if (testCases[i] < minIter) minIter = testCases[i];
}
testAvg /= testCases.length;

console.log("Promedio: " + testAvg);
console.log("Maxima iteracion: " + maxIter);
console.log("Minima iteracion: " + minIter);