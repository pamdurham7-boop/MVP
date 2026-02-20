package API_PASS;
import API_PASS_SECRET.MAIN_pass;

public class DB_pass extends MAIN_pass {
    public static String finalPassword(String pass) {
        if(pass == getPassword(pass)) {
            return MAIN_pass.cppPass();
        } else {
            return "PERMISSION DENIED!";
        }
    }
}