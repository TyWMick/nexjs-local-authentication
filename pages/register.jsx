"use strict";

import React, { useState } from "react";
import {
  Form,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  FormFeedback,
  Button,
  Row,
  Spinner,
  FormText
} from "reactstrap";
import Link from "next/link";
import LoginLayout from "../components/login-layout";
import { Formik } from "formik";
import * as Yup from "yup";
import fetch from "isomorphic-unfetch";
import { login } from "../utils/auth";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [networkErrors, setNetworkErrors] = useState(false);

  return (
    <LoginLayout pageTitle="Register">
      <Formik
        initialValues={{ username: "", password: "", retypePassword: "" }}
        validationSchema={Yup.object({
          username: Yup.string()
            .matches(
              /^\w+$/,
              "Usernames can only consist of letters, numbers, and underscores."
            )
            .required("Please choose a username."),
          password: Yup.string().required("Please choose a password."),
          retypePassword: Yup.string().required("Just to make sure.")
        })}
        onSubmit={async (values, { setFieldError }) => {
          setNetworkErrors(false);

          if (values.password != values.retypePassword) {
            setFieldError(
              "retypePassword",
              "Oops, your passwords don't match!"
            );
          } else {
            setLoading(true);

            try {
              const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
              });
              if (response.status === 200) {
                const { token } = await response.json();
                login({ token }, false);
              } else if (response.status === 409) {
                setFieldError("username", "That username is already taken.");
              } else {
                console.log("Registration failed.");
                // https://github.com/developit/unfetch#caveats
                let error = new Error(response.statusText);
                error.response = response;
                throw error;
              }
            } catch (err) {
              console.error(
                "You have an error in your code or there are network issues.",
                err
              );
              setNetworkErrors(true);
            }
          }

          setLoading(false);
        }}
      >
        {formik => (
          <Form
            noValidate
            onSubmit={formik.handleSubmit}
            className="mx-auto"
          >
            <FormGroup>
              <Label for="username">Username</Label>
              <InputGroup className="mb-0">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText id="at-sign">@</InputGroupText>
                </InputGroupAddon>
                <Input
                  name="username"
                  id="username"
                  aria-describedby="at-sign"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                  invalid={formik.touched.username && !!formik.errors.username}
                />
                <FormFeedback>{formik.errors.username}</FormFeedback>
              </InputGroup>
              <FormText color="muted">You can change this later.</FormText>
            </FormGroup>

            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                name="password"
                id="password"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                invalid={formik.touched.password && !!formik.errors.password}
              />
              <FormFeedback>{formik.errors.password}</FormFeedback>
            </FormGroup>

            <FormGroup>
              <Label for="retypePassword">Retype password</Label>
              <Input
                name="retypePassword"
                id="retypePassword"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.retypePassword}
                invalid={
                  formik.touched.retypePassword &&
                  formik.values.retypePassword != formik.values.password
                }
              />
              <FormFeedback>
                {formik.errors.retypePassword ||
                  "Oops, your passwords don't match!"}
              </FormFeedback>
            </FormGroup>

            <Row>
              <div className="update mx-auto">
                <Button
                  className="btn-round"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Register"}
                </Button>
              </div>
            </Row>

            {networkErrors && (
              <Row>
                <div className="mx-auto text-danger">
                  One of us is experiencing network errors 😞
                </div>
              </Row>
            )}

            <Row>
              <div className="update mx-auto mb-2">
                Already have an account?{" "}
                <Link href="/login">
                  <a>Log in</a>
                </Link>
                .
              </div>
            </Row>
          </Form>
        )}
      </Formik>
    </LoginLayout>
  );
}
