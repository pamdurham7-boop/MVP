package API_PASS_SECRET;

public class MAIN_pass {

    public String getPassword(String pass) {
        if (pass != null && pass.equals(validatePasswordWithCpp(pass))) {
            return cppPass();
        } else {
            return "PERMISSION DENIED!";
        }
    }
    public static native String validatePasswordWithCpp(String input);
    public static native String cppPass();

    static {
        System.loadLibrary("libpassword_validator.os");
    }
}