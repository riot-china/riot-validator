# riot-validator
this is a riot validator mixin
###Install
    npm install riot-validator
###Usage
    <test>
        <form name="my_form">
            <input required/>
        </form>
        <script>
            this.mixin('form');
            this.useForm();
            //...
        </script>
    </test>
###Validators
####Built-in validators

    type="email"
    type="url"
    type="number"
    required
    minlength
    maxlength
    pattern
    min (for type="number")
    max (for type="number")

####Associated state classes
.f-invalid .f-valid
    
when error:
    
.f-invalid-required .f-invalid-max  ...
####Custom validator
    registerValidators({
        name: 'custom-validator',
        fn: function(){
            return ...
        }
    })
