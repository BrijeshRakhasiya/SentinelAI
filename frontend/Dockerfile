# --- Build stage ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# REACT_APP_* vars are baked in at build time by CRA.
ARG REACT_APP_API_URL=
ARG REACT_APP_SUPABASE_URL=
ARG REACT_APP_SUPABASE_PUBLISHABLE_KEY=
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_PUBLISHABLE_KEY=$REACT_APP_SUPABASE_PUBLISHABLE_KEY
RUN npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine

ENV PORT=80

COPY --from=build /app/build /usr/share/nginx/html
# The official nginx image envsubst-renders templates on startup, so this
# listens on Render's $PORT in production and 80 locally by default.
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
