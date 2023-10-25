import axios from "axios";

const userCheck = async (router) => {
    try {
        axios.defaults.headers.common = {
            Authorization: `bearer ${localStorage.getItem("token")}`,
        };
        const response = await axios.get(`http://localhost:8080/users/role`);
        if (response.status == 200) {
            if (response.data.roles.includes("admin")) {
                router.replace("/dashboard-admin");
            } else if (response.data.roles.includes("physician")) {
                router.replace("/dashboard-physician");
            } else if (response.data.roles.includes("patient")) {
                router.replace("/dashboard-patient");
            } else {
                router.replace("/");
            }
        } else {
            router.replace("/");
        }
    } catch (error) {
        console.error(error);

        switch (error.response.data.detail) {
            case "User must be logged in":
                router.replace("/");
                break;
        }
    }
};

export default userCheck;