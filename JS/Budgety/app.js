/*
OBJECT to process budget (Calculation, Store data, Add/Remove data)
*/
var budgetController = (function(){
    //Expence constructor
    var Expense = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
        this.calcParcentage = function(totalIncome){
            if (totalIncome > 0){
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
        };
        this.getPercentage = function(){
          return this.percentage
        };
    };
    //Another way to define functions
    
    // Expense.prototype.calcParcentage = function(totalIncome){
    //     if (totalIncome > 0){
    //         this.percentage = Math.round((this.value / totalIncome) * 100);
    //     } else {
    //         this.percentage = -1;
    //     }
    // };

    // Expense.prototype.getPercentage = function(){
    //     return this.percentage
    // };

    //Income constructor
    var Income = function(id, desc, value){
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    // all data necessary to calculate budget
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0            
        },
        budget: 0,
        percentage: -1
    }

    //Calculation total for the type
    var calcTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr, i, array){
            sum += curr.value;
        });
        data.totals[type] = sum;
    }

    //Public functions
    return {
        // add a new item
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //ID = the last id + 1
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            //create a new item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);

            } else {
                newItem = new Income(ID, des, val);
            }

            //Store data
            data.allItems[type].push(newItem);
            //data.totals[type].push(data.totals[type]+val);
            return newItem;
        },
        //Calculate budget with current data
        calculationBudget: function(){
            //calc total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            //calc budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;

            //calc ratio (expenses / income)
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        //return budget info
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        //delete an existing item 
        deleteItem: function(targetid){
            splittedID = targetid.split('-');
            type = splittedID[0];
            id = parseInt(splittedID[1]);

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            //only if we found the target
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        //calculation percentage for each expenses
        calculateParcentages: function(){
            data.allItems.exp.forEach(function(curr){
                curr.calcParcentage(data.totals.inc);

            })
        },
        //return percentage
        getPercentage: function(){
            var allPerc = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            })
            return allPerc;
        },
        //to debug
        testing: function() {
            console.log(data);
        }
    };
})();


/*
OBJECT to controll UI (Display data, format display, manipulate DOM)
*/
var UIController = (function(){

    //DOM labels
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        itemPercentageLabel: '.item__percentage',
        container: '.container',
        dateLabel: '.budget__title--month'

    };
    var formatNumber = function(num, type){
        /*
        + or -
        2 decimals
        thousand comma separator
        */

        //get absolute number & set 2 decimals
        num = Math.abs(num).toFixed(2);
        numSplit = num.split('.');
        numInt = numSplit[0];
        numDec = numSplit[1];

        //add thousand comma separator
        if (numInt.length > 3) {
            retInt = '';
            for (i = 0; i < Math.ceil(numInt.length/3) - 1; i++){
                retInt = ',' + numInt.substr(numInt.length - (i + 1) * 3, 3) + retInt;
            }
            firstDigit = numInt.length % 3 === 0 ? 3 : numInt.length % 3;
            retInt = numInt.substr(0, firstDigit) + retInt;
            numInt = retInt;
        }
        
        return (type === 'exp' ? '-' : '+') + numInt + '.' + numDec;

    };

    //utility function to forEach loop for node
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    //public functions
    return {
        //get input value
        getinput: function(){
            return {
                //inc or exp
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputVal).value)
            }
        },

        // to share DOM label out of this class
        getDOMstrings: function(){
            return DOMstrings;
        },

        //add a new HTML
        addListItems: function(obj, type){
            var html, newHtml, element;
            //create HTML
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%p%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }           

            //Replace the value
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        //clear all input fields
        clearFields: function(){
            var fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
            //console.log(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(curr, i, arr){
                curr.value = '';
            });
            fieldsArr[0].focus();

        },
        //display budget
        displayBudget: function(obj){
            var type = obj.budget >= 0 ? 'inc' : 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage >= 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        //delete item on list
        deleteListItem: function(id){
            var el =  document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        //display percentages for each expenses
        displayPercentages: function(percentages){
            
            var fields = document.querySelectorAll(DOMstrings.itemPercentageLabel);


            nodeListForEach(fields, function(curr, i){
                curr.textContent = percentages[i] + '%';
                if (percentages[i] >= 0){
                    curr.textContent = percentages[i] + '%';
                } else {
                    curr.textContent = '---';
                }

            });
        },

        //display month
        displayMonth: function(){
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ':' +year;
        },

        //change color of input cell depending on inc/exp
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputVal);

            nodeListForEach(fields, function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.addBtn).classList.toggle('red');

        }

    }


})();

/*
GLOBAL APP CONTROLLER, handle data between UI and Budget calculation
*/

var controller = (function(budgetCtrl, UICtrl){

        //Set up all the event listener on the page
        var setupEventListeners = function(){
            var DOMstrings = UICtrl.getDOMstrings();
            //Click Add button
            document.querySelector(DOMstrings.addBtn).addEventListener('click', ctrlAddItem);

            //Press Enter key (= Click Add button)
            document.addEventListener('keypress', function(event){
                //Only Enter key is 
                if (event.keyCode !== 13 && event.which !== 13) {
                    return;
                }
                ctrlAddItem();
            });

            document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changedType);

            document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);
        };

        // Top part
        var updateBudget = function() {
            //calc budget
            budgetCtrl.calculationBudget();
            
            //return the budget
            var budget = budgetCtrl.getBudget();

            //Display the budget
            UICtrl.displayBudget(budget) 
        };

        //update percentages of each expenses
        var updatePercentages = function(){
            //calculate percentages
            budgetCtrl.calculateParcentages();

            //get percentage
            var percentages = budgetCtrl.getPercentage();

            //console.log(percentages);

            UICtrl.displayPercentages(percentages);
        };

        // Get input data (inc/exp, description, value)
        var ctrlAddItem = function(){
            var input, newItem;
            
            input = UICtrl.getinput();
            //input validation
            if (input.desc === '' || isNaN(input.value) || input.value <= 0){
                return;
            }

            //Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
            
            //Add item to UI
            UICtrl.addListItems(newItem, input.type);

            //clear the field
            UICtrl.clearFields();

            //Calculate the budget
            updateBudget();

            //UPDATE percentages
            updatePercentages();
        };

        // delete item
        var ctrlDeleteItem = function(event){
            
            //select delete target
            if (event.target.className !== 'ion-ios-close-outline'){
                console.log('NOT A DELETE TARGET');
                return;
            }
            deleteId = event.target.parentNode.parentNode.parentNode.parentNode.id;

            //delete data
            budgetCtrl.deleteItem(deleteId);
            
            //remove UI object
            UICtrl.deleteListItem(deleteId);

            //Calculate the budget
            updateBudget();

            updatePercentages();
        };

        //Public functions
        return {
            //Top page initialization
            init: function() {
                console.log('App initiated');
                UICtrl.displayBudget({
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1
                });
                UICtrl.displayMonth()
                setupEventListeners();
            }
        }
//Add 2 controllers to this function
})(budgetController, UIController);

//call init when the page is refreshed
controller.init();