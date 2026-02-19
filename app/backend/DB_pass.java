package API_PASS;
import API_PASS_SECRET.MAIN_pass;

public class DB_pass extends MAIN_pass{
    public static String finalPassword(pass){
        if (pass == this.getPassword()){
            return this.password;
        }
        else{
            return "PERMISSION DENIED!";
        }
    }
    
}