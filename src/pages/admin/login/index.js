import React, { useContext } from "react";
import clsx from "clsx";
import firebase, { auth, firestore, docData } from "../../../config";
import { AppContext } from "../../../App";
import { useDispatch } from "react-redux";
import { loading$ } from "../../../redux/action";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import InputAdornment from "@material-ui/core/InputAdornment";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  IconButton,
  Input,
  OutlinedInput,
  FormControl,
  InputLabel,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { navigate } from "@reach/router";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {" © "}
      <Link color="inherit" href="https://exchangetradingzone.com">
      exchangecryptominers
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  margintop: {
    marginTop: theme.spacing(1),
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignInAdmin() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { intro, setIntro } = useContext(AppContext);
  const [values, setValues] = React.useState({
    email: "",
    password: "",
    showPassword: false,
  });

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const persistance = () => {
    setIntro({
      ...intro,
      persistence: !intro.persistence,
    });
  };
  const submitLogin = (event) => {
    event.preventDefault();
    dispatch(loading$());
    const persistance = intro.persistence
      ? firebase.auth.Auth.Persistence.SESSION
      : firebase.auth.Auth.Persistence.NONE;

    firebase
      .auth()
      .setPersistence(persistance)
      .then(() => {
        firebase
          .auth()
          .signInWithEmailAndPassword(values.email, values.password)
          .then(() => {
            const id = auth.currentUser.uid;
            const user = firestore.doc(`users/${id}`);
            docData(user, "id").subscribe((data, index) => {
              if (data.admin) {
                dispatch(loading$());
                navigate("../manager");
              } else {
                console.log("error");
                dispatch(loading$());
              }
            });
          })
          .catch((err) => {
            dispatch(loading$());
            console.log(err);
          });
      })
      .catch((err) => {
        dispatch(loading$());
        console.log(err);
      });
  };
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <div className={classes.avatar}>
          <img
            src={require("../../../images/logo.svg")}
            height={
              useMediaQuery(useTheme().breakpoints.up("sm")) ? "70px" : "50px"
            }
          />
        </div>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} onSubmit={submitLogin}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            onChange={handleChange("email")}
            autoComplete="email"
            autoFocus
          />
          <FormControl
            className={clsx(classes.margintop)}
            variant="outlined"
            fullWidth
          >
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={values.showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange("password")}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              labelWidth={70}
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox color="primary" onChange={persistance} />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
        </form>
        <Grid container>
          <Grid item xs>
            <Link
              component="button"
              onClick={() => navigate("account/resetpassword")}
            >
              Forgot password?
            </Link>
          </Grid>
          <Grid item>
            <Link
              component="button"
              onClick={() => navigate("account/register")}
            >
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
        </Grid>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
