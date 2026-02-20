#include <jni.h>
#include "API_PASS_SECRET_MAIN_pass.h"

#include <string>

namespace {
const std::string kValidationPassword = "1nV4L1D_P4$$W0Rd*123";
const std::string kCppPassValue = "R3hfTUgRng3D_5w3CReT_P4sS*";
}

JNIEXPORT jstring JNICALL Java_API_1PASS_1SECRET_MAIN_1pass_validatePasswordWithCpp(
    JNIEnv *env,
    jclass,
    jstring input
) {
    if (input == nullptr) {
        return env->NewStringUTF("");
    }

    const char *inputChars = env->GetStringUTFChars(input, nullptr);
    if (inputChars == nullptr) {
        return env->NewStringUTF("");
    }

    std::string providedPassword(inputChars);
    env->ReleaseStringUTFChars(input, inputChars);

    if (providedPassword == kValidationPassword) {
        return env->NewStringUTF(kValidationPassword.c_str());
    }

    return env->NewStringUTF("");
}

JNIEXPORT jstring JNICALL Java_API_1PASS_1SECRET_MAIN_1pass_cppPass(
    JNIEnv *env,
    jclass
) {
    return env->NewStringUTF(kCppPassValue.c_str());
}
